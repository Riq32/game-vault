import os
import requests
import random
from datetime import datetime, timedelta, date
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.utils import secure_filename
import openai

from models import db, User, VaultItem, Review, Preference, Notification

# ==========================================
# 1. INITIALIZATION & CONFIGURATION
# ==========================================
app = Flask(__name__)

# Complete CORS configuration allowing all methods, credentials, and headers
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///vault.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secure-dev-key-123')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

RAWG_API_KEY = os.getenv('RAWG_API_KEY')
openai.api_key = os.getenv('OPENAI_API_KEY')

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# ==========================================
# 2. HELPER FUNCTIONS
# ==========================================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_gamification_state(total_xp):
    level = 1
    current_tier_base_xp = 0
    xp_needed_for_next = 100

    while total_xp >= current_tier_base_xp + xp_needed_for_next and level < 100:
        current_tier_base_xp += xp_needed_for_next
        level += 1
        xp_needed_for_next = int(100 * (level ** 1.2))

    xp_into_level = total_xp - current_tier_base_xp
    progress_percentage = int((xp_into_level / xp_needed_for_next) * 100) if level < 100 else 100

    return {
        "level": level, 
        "total_xp": total_xp, 
        "xp_into_level": xp_into_level, 
        "xp_needed": xp_needed_for_next, 
        "progress_percentage": progress_percentage
    }

def generate_smart_notifications(user):
    current_rank = User.query.filter(User.xp > user.xp).count() + 1
    if user.last_rank != 0 and current_rank < user.last_rank:
        db.session.add(Notification(user_id=user.id, title="Rank Up", message=f"You climbed the global leaderboard to Rank {current_rank}!", type="leaderboard"))
    user.last_rank = current_rank

    backlog_items = [i for i in user.vault_items if i.status == 'Backlog']
    if backlog_items and random.random() > 0.4: 
        game = random.choice(backlog_items)
        existing = Notification.query.filter_by(user_id=user.id, type='reminder').filter(Notification.message.contains(game.game_name)).first()
        if not existing:
            db.session.add(Notification(user_id=user.id, title="Vault Reminder", message=f"'{game.game_name}' has been sitting in your backlog. Is it time to deploy?", type="reminder"))
    
    if user.preferences and user.preferences.genres:
        genres = [g.strip().capitalize() for g in user.preferences.genres.split(',')]
        if genres and random.random() > 0.5: 
            genre = random.choice(genres)
            db.session.add(Notification(user_id=user.id, title="Algorithm Suggestion", message=f"Based on your directives, we recommend exploring top-rated {genre} titles in the Discover tab.", type="recommendation"))

# ==========================================
# 3. IDENTITY & AUTHENTICATION
# ==========================================
@app.route('/api/status', methods=['GET', 'OPTIONS'])
def health_check():
    return jsonify({"status": "Online"}), 200

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    data = request.get_json()
    if not all(k in data for k in ("full_name", "username", "email", "password")):
        return jsonify({"error": "All fields are required"}), 400
        
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already in use"}), 409
        
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "Username already taken"}), 409
    
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(
        full_name=data.get('full_name'),
        username=data.get('username'), 
        email=data.get('email'), 
        password_hash=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"token": create_access_token(identity=new_user.id), "username": new_user.username, "full_name": new_user.full_name}), 201

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        return jsonify({"token": create_access_token(identity=user.id), "username": user.username, "full_name": user.full_name}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/profile', methods=['GET', 'PATCH', 'OPTIONS'])
@jwt_required(optional=True)
def profile():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if request.method == 'GET':
        today = datetime.utcnow().date()
        daily_reward = 0
        streak_milestone = False

        if user.last_login_date != today:
            if user.last_login_date == today - timedelta(days=1):
                user.current_streak += 1
            else:
                user.current_streak = 1
                
            user.last_login_date = today
            if user.current_streak > user.highest_streak:
                user.highest_streak = user.current_streak
            
            daily_reward = 10
            user.xp += daily_reward
            if user.current_streak % 7 == 0:
                daily_reward += 50
                user.xp += 50
                streak_milestone = True
                db.session.add(Notification(user_id=user.id, title="Streak Milestone", message=f"Flawless {user.current_streak}-day operation streak! +50 Bonus XP awarded.", type="activity"))
            
            generate_smart_notifications(user)
            db.session.commit()

        return jsonify({
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "join_date": user.join_date.strftime("%Y-%m-%d"),
            "gamification": calculate_gamification_state(user.xp),
            "streak": {
                "current": user.current_streak,
                "highest": user.highest_streak,
                "reward_awarded": daily_reward,
                "milestone": streak_milestone
            },
            "stats": {
                "total": len(user.vault_items),
                "completed": len([i for i in user.vault_items if i.status == 'Completed']),
                "playing": len([i for i in user.vault_items if i.status == 'Playing']),
                "backlog": len([i for i in user.vault_items if i.status == 'Backlog'])
            }
        }), 200
        
    if request.method == 'PATCH':
        data = request.get_json()
        if 'avatar_url' in data: user.avatar_url = data['avatar_url']
        if 'full_name' in data: user.full_name = data['full_name']
        if 'username' in data: user.username = data['username']
        if 'email' in data: user.email = data['email']
        db.session.commit()
        return jsonify({"message": "Identity updated successfully", "user": {"username": user.username, "full_name": user.full_name}}), 200

# ==========================================
# 4. NOTIFICATIONS & LEADERBOARD
# ==========================================
@app.route('/api/notifications', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_notifications():
    current_user_id = get_jwt_identity()
    if not current_user_id: return jsonify([]), 200

    notifs = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).limit(20).all()
    return jsonify([{"id": n.id, "title": n.title, "message": n.message, "type": n.type, "is_read": n.is_read, "date": n.created_at.strftime("%Y-%m-%d %H:%M")} for n in notifs]), 200

@app.route('/api/notifications/<int:notif_id>/read', methods=['PATCH', 'OPTIONS'])
@jwt_required(optional=True)
def read_notification(notif_id):
    current_user_id = get_jwt_identity()
    if not current_user_id: return jsonify({"error": "Unauthorized"}), 401

    notif = Notification.query.filter_by(id=notif_id, user_id=current_user_id).first()
    if notif:
        notif.is_read = True
        db.session.commit()
    return jsonify({"message": "Marked as read"}), 200

@app.route('/api/notifications/read-all', methods=['PATCH', 'OPTIONS'])
@jwt_required(optional=True)
def read_all_notifications():
    current_user_id = get_jwt_identity()
    if not current_user_id: return jsonify({"error": "Unauthorized"}), 401

    Notification.query.filter_by(user_id=current_user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All marked as read"}), 200

@app.route('/api/leaderboard', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_leaderboard():
    current_user_id = get_jwt_identity()
    users = User.query.order_by(User.xp.desc(), User.current_streak.desc()).limit(100).all()
    return jsonify([{
        "rank": idx + 1, "id": u.id, "username": u.username, "avatar_url": u.avatar_url,
        "level": calculate_gamification_state(u.xp)["level"], "xp": u.xp, "streak": u.current_streak, "is_current_user": u.id == current_user_id
    } for idx, u in enumerate(users)]), 200

# ==========================================
# 5. VAULT & PREFERENCES
# ==========================================
@app.route('/api/vault', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required(optional=True)
def handle_vault():
    user_id = get_jwt_identity()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401

    if request.method == 'GET':
        items = VaultItem.query.filter_by(user_id=user_id).order_by(VaultItem.added_date.desc()).all()
        return jsonify([{"id": i.id, "game_id": i.game_id, "game_name": i.game_name, "status": i.status} for i in items]), 200
    
    data = request.get_json()
    if VaultItem.query.filter_by(user_id=user_id, game_id=data.get('game_id')).first(): 
        return jsonify({"error": "Asset exists"}), 409
    
    db.session.add(VaultItem(user_id=user_id, game_id=data.get('game_id'), game_name=data.get('game_name')))
    db.session.add(Notification(user_id=user_id, title="Asset Secured", message=f"Added '{data.get('game_name')}' to your tracking network.", type="vault"))
    db.session.commit()
    return jsonify({"message": "Secured in vault"}), 201

@app.route('/api/vault/<int:item_id>', methods=['PATCH', 'DELETE', 'OPTIONS'])
@jwt_required(optional=True)
def modify_vault_item(item_id):
    user_id = get_jwt_identity()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401

    item = VaultItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item: return jsonify({"error": "Item not found"}), 404
        
    if request.method == 'PATCH':
        new_status = request.get_json().get('status', item.status)
        user = User.query.get(user_id)
        
        initial_level = calculate_gamification_state(user.xp)["level"]
        xp_gained = 0
        
        if new_status != item.status:
            if new_status == 'Playing': 
                db.session.add(Notification(user_id=user.id, title="Status Updated", message=f"Now actively playing '{item.game_name}'.", type="activity"))
            elif new_status == 'Backlog': 
                db.session.add(Notification(user_id=user.id, title="Status Updated", message=f"Moved '{item.game_name}' back to Backlog.", type="activity"))
            
            if new_status == 'Completed' and not item.xp_awarded:
                xp_gained = 100
                user.xp += xp_gained
                item.xp_awarded = True
                db.session.add(Notification(user_id=user.id, title="Mission Accomplished", message=f"Completed '{item.game_name}'. +100 XP awarded.", type="achievement"))
            elif new_status != 'Completed' and item.xp_awarded:
                user.xp = max(0, user.xp - 100)
                item.xp_awarded = False

        item.status = new_status
        db.session.commit()
        
        new_level = calculate_gamification_state(user.xp)["level"]
        level_up = new_level > initial_level
        if level_up: 
            db.session.add(Notification(user_id=user.id, title="Level Up!", message=f"Congratulations! You've reached Level {new_level}.", type="achievement"))
        db.session.commit()

        return jsonify({"message": "Status updated", "gamification": {"xp_gained": xp_gained, "level_up": level_up, "new_level": new_level}}), 200
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Asset expunged"}), 200

@app.route('/api/preferences', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def save_preferences():
    user_id = get_jwt_identity()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401

    pref = Preference.query.filter_by(user_id=user_id).first() or Preference(user_id=user_id)
    db.session.add(pref)
    pref.platforms = ",".join(request.get_json().get('platforms', []))
    pref.genres = ",".join(request.get_json().get('genres', []))
    db.session.commit()
    return jsonify({"message": "Directives saved"}), 200

# ==========================================
# 6. EXTERNAL PROXIES (RAWG & AI), FILE I/O & REVIEWS
# ==========================================
@app.route('/api/games', methods=['GET', 'OPTIONS'])
def get_games():
    page = request.args.get('page', 1)
    search = request.args.get('search', '')
    url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&page={page}&page_size=20"
    if search:
        url += f"&search={search}"
        
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException:
        return jsonify({
            "results": [
                {"id": 1, "name": "System Override (Fallback)", "rating": 5.0, "released": "2026-01-01"},
                {"id": 2, "name": "Neural Link Severed", "rating": 0.0, "released": "Unknown"}
            ]
        }), 200

@app.route('/api/games/<int:game_id>', methods=['GET', 'OPTIONS'])
def get_game_details(game_id):
    try:
        response = requests.get(f"https://api.rawg.io/api/games/{game_id}?key={RAWG_API_KEY}", timeout=10)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException:
        return jsonify({"error": "Target intellectual property not found."}), 404

@app.route('/api/recommendations', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_recommendations():
    user_id = get_jwt_identity()
    pref = Preference.query.filter_by(user_id=user_id).first() if user_id else None
    
    tags = "singleplayer"
    if pref and pref.genres:
        tags = pref.genres.split(',')[0].lower()

    try:
        url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&tags={tags}&ordering=-rating&page_size=4"
        response = requests.get(url, timeout=10)
        return jsonify(response.json().get('results', [])), 200
    except:
        return jsonify([]), 200

@app.route('/api/reviews', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def post_review():
    user_id = get_jwt_identity()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    new_review = Review(
        user_id=user_id,
        game_id=data.get('game_id'),
        rating=data.get('rating'),
        text=data.get('text')
    )
    db.session.add(new_review)
    db.session.commit()
    
    user = User.query.get(user_id)
    return jsonify({
        "message": "Transmission logged", 
        "review": {
            "id": new_review.id,
            "user": user.username,
            "rating": new_review.rating,
            "text": new_review.text,
            "date": new_review.created_at.strftime("%Y-%m-%d")
        }
    }), 201

@app.route('/api/reviews/<int:game_id>', methods=['GET', 'OPTIONS'])
def get_reviews(game_id):
    reviews = Review.query.filter_by(game_id=game_id).order_by(Review.created_at.desc()).all()
    return jsonify([{
        "id": r.id,
        "user": r.author.username,
        "rating": r.rating,
        "text": r.text,
        "date": r.created_at.strftime("%Y-%m-%d")
    } for r in reviews]), 200

@app.route('/api/translate', methods=['POST', 'OPTIONS'])
def translate_description():
    data = request.get_json()
    text_to_translate = data.get('text', '')
    
    if not text_to_translate or not openai.api_key:
        return jsonify({"error": "Missing text or Neural Link key"}), 400
        
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional video game localization engine. Translate the following HTML description into Japanese. You MUST perfectly preserve all HTML tags, structure, and formatting. Do not translate the tags themselves."},
                {"role": "user", "content": text_to_translate}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        return jsonify({"translated_text": response.choices[0].message.content.strip()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def upload_image():
    user_id = get_jwt_identity()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401

    if 'image' not in request.files: 
        return jsonify({"error": "No visual data detected"}), 400
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename): 
        return jsonify({"error": "Invalid file"}), 400
    filename = secure_filename(f"user_{user_id}_{file.filename}")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({"url": f"/static/uploads/{filename}", "message": "Visual data secured"}), 201

@app.route('/static/uploads/<filename>', methods=['GET'])
def serve_uploaded_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)