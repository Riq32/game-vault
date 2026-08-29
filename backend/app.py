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
CORS(app, resources={r"/api/*": {"origins": "*"}})

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
    level, current_tier_base_xp, xp_needed_for_next = 1, 0, 100
    while total_xp >= current_tier_base_xp + xp_needed_for_next and level < 100:
        current_tier_base_xp += xp_needed_for_next
        level += 1
        xp_needed_for_next = int(100 * (level ** 1.2))
    xp_into_level = total_xp - current_tier_base_xp
    progress = int((xp_into_level / xp_needed_for_next) * 100) if level < 100 else 100
    return {"level": level, "total_xp": total_xp, "xp_into_level": xp_into_level, "xp_needed": xp_needed_for_next, "progress_percentage": progress}

def generate_smart_notifications(user):
    # 1. Leaderboard Movement Check
    current_rank = User.query.filter(User.xp > user.xp).count() + 1
    if user.last_rank != 0 and current_rank < user.last_rank:
        db.session.add(Notification(user_id=user.id, title="Rank Up", message=f"You climbed the global leaderboard to Rank {current_rank}!", type="leaderboard"))
    user.last_rank = current_rank

    # 2. Backlog Reminder
    backlog_items = [i for i in user.vault_items if i.status == 'Backlog']
    if backlog_items and random.random() > 0.4:
        game = random.choice(backlog_items)
        existing = Notification.query.filter_by(user_id=user.id, type='reminder').filter(Notification.message.contains(game.game_name)).first()
        if not existing:
            db.session.add(Notification(user_id=user.id, title="Vault Reminder", message=f"'{game.game_name}' has been sitting in your backlog.", type="reminder"))
    
    # 3. Preference Recommendations
    if user.preferences and user.preferences.genres:
        genres = [g.strip().capitalize() for g in user.preferences.genres.split(',')]
        if genres and random.random() > 0.5:
            genre = random.choice(genres)
            db.session.add(Notification(user_id=user.id, title="Algorithm Suggestion", message=f"Based on your directives, we recommend exploring top-rated {genre} titles.", type="recommendation"))

# ==========================================
# 3. API ROUTES
# ==========================================
@app.route('/api/status', methods=['GET'])
def health_check(): return jsonify({"status": "Online"}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first(): return jsonify({"error": "Email already in use"}), 409
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(username=data.get('username'), email=data.get('email'), password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"token": create_access_token(identity=new_user.id), "username": new_user.username}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        return jsonify({"token": create_access_token(identity=user.id), "username": user.username}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/profile', methods=['GET', 'PATCH'])
@jwt_required()
def profile():
    user = User.query.get(get_jwt_identity())
    
    if request.method == 'GET':
        today = datetime.utcnow().date()
        daily_reward = 0

        if user.last_login_date != today:
            if user.last_login_date == today - timedelta(days=1): 
                user.current_streak += 1
                db.session.add(Notification(user_id=user.id, title="Daily Login", message=f"{user.current_streak} day streak maintained. +10 XP.", type="activity"))
            else: 
                user.current_streak = 1
                db.session.add(Notification(user_id=user.id, title="Welcome Back", message="Daily login streak initiated. +10 XP.", type="activity"))
                
            user.last_login_date = today
            if user.current_streak > user.highest_streak: user.highest_streak = user.current_streak
            
            daily_reward = 10
            user.xp += daily_reward

            # XP Streak Milestones
            if user.current_streak % 7 == 0:
                user.xp += 50
                db.session.add(Notification(user_id=user.id, title="Streak Milestone", message=f"Flawless {user.current_streak}-day operation streak! +50 Bonus XP.", type="achievement"))
            
            generate_smart_notifications(user)
            db.session.commit()

        return jsonify({
            "username": user.username, "email": user.email, "avatar_url": user.avatar_url,
            "gamification": calculate_gamification_state(user.xp),
            "streak": {"current": user.current_streak, "highest": user.highest_streak},
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
        if 'username' in data: user.username = data['username']
        if 'email' in data: user.email = data['email']
        db.session.commit()
        return jsonify({"message": "Identity updated successfully", "user": {"username": user.username}}), 200

# ==========================================
# 4. NOTIFICATION ROUTES
# ==========================================
@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    notifs = Notification.query.filter_by(user_id=get_jwt_identity()).order_by(Notification.created_at.desc()).limit(25).all()
    # Format dates elegantly for the UI
    return jsonify([{"id": n.id, "title": n.title, "message": n.message, "type": n.type, "is_read": n.is_read, "date": n.created_at.strftime("%Y-%m-%d %H:%M")} for n in notifs]), 200

@app.route('/api/notifications/<int:notif_id>/read', methods=['PATCH'])
@jwt_required()
def read_notification(notif_id):
    notif = Notification.query.filter_by(id=notif_id, user_id=get_jwt_identity()).first()
    if notif:
        notif.is_read = True
        db.session.commit()
    return jsonify({"message": "Marked as read"}), 200

@app.route('/api/notifications/read-all', methods=['PATCH'])
@jwt_required()
def read_all_notifications():
    Notification.query.filter_by(user_id=get_jwt_identity(), is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All marked as read"}), 200

# ==========================================
# 5. VAULT & GAMIFICATION ROUTES
# ==========================================
@app.route('/api/vault', methods=['GET', 'POST'])
@jwt_required()
def handle_vault():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        items = VaultItem.query.filter_by(user_id=user_id).order_by(VaultItem.added_date.desc()).all()
        return jsonify([{"id": i.id, "game_id": i.game_id, "game_name": i.game_name, "status": i.status} for i in items]), 200
    
    data = request.get_json()
    if VaultItem.query.filter_by(user_id=user_id, game_id=data.get('game_id')).first(): return jsonify({"error": "Asset exists"}), 409
    
    db.session.add(VaultItem(user_id=user_id, game_id=data.get('game_id'), game_name=data.get('game_name')))
    # Log 'Added to Vault'
    db.session.add(Notification(user_id=user_id, title="Asset Secured", message=f"Added '{data.get('game_name')}' to your tracking network.", type="vault"))
    db.session.commit()
    
    return jsonify({"message": "Secured in vault"}), 201

@app.route('/api/vault/<int:item_id>', methods=['PATCH', 'DELETE'])
@jwt_required()
def modify_vault_item(item_id):
    user_id = get_jwt_identity()
    item = VaultItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item: return jsonify({"error": "Item not found"}), 404
        
    if request.method == 'PATCH':
        new_status = request.get_json().get('status', item.status)
        user = User.query.get(user_id)
        
        initial_level = calculate_gamification_state(user.xp)["level"]
        xp_gained = 0
        
        if new_status != item.status:
            # Status change notification
            if new_status == 'Playing':
                db.session.add(Notification(user_id=user.id, title="Status Updated", message=f"Now actively playing '{item.game_name}'.", type="activity"))
            elif new_status == 'Backlog':
                db.session.add(Notification(user_id=user.id, title="Status Updated", message=f"Moved '{item.game_name}' back to Backlog.", type="activity"))
            
            # Completion XP logic
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

        # Level up notification
        if level_up:
            db.session.add(Notification(user_id=user.id, title="Level Up!", message=f"Congratulations! You've reached Level {new_level}.", type="achievement"))
            db.session.commit()

        return jsonify({
            "message": "Status updated", 
            "gamification": {"xp_gained": xp_gained, "level_up": level_up, "new_level": new_level}
        }), 200
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Asset expunged"}), 200

# ==========================================
# 6. REMAINING CORE ROUTES
# ==========================================
@app.route('/api/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    current_user_id = get_jwt_identity()
    users = User.query.order_by(User.xp.desc(), User.current_streak.desc()).limit(100).all()
    return jsonify([{
        "rank": idx + 1, "id": u.id, "username": u.username, "avatar_url": u.avatar_url,
        "level": calculate_gamification_state(u.xp)["level"], "xp": u.xp, "streak": u.current_streak, "is_current_user": u.id == current_user_id
    } for idx, u in enumerate(users)]), 200

@app.route('/api/preferences', methods=['POST'])
@jwt_required()
def save_preferences():
    user_id = get_jwt_identity()
    pref = Preference.query.filter_by(user_id=user_id).first() or Preference(user_id=user_id)
    db.session.add(pref)
    pref.platforms = ",".join(request.get_json().get('platforms', []))
    pref.genres = ",".join(request.get_json().get('genres', []))
    db.session.commit()
    return jsonify({"message": "Directives saved"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)