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
    # 1. Backlog Reminder
    backlog_items = [i for i in user.vault_items if i.status == 'Backlog']
    if backlog_items and random.random() > 0.4: # 60% chance to generate reminder
        game = random.choice(backlog_items)
        existing = Notification.query.filter_by(user_id=user.id, type='reminder').filter(Notification.message.contains(game.game_name)).first()
        if not existing:
            db.session.add(Notification(user_id=user.id, title="Vault Reminder", message=f"'{game.game_name}' has been sitting in your backlog. Is it time to deploy?", type="reminder"))
    
    # 2. Preference Recommendations
    if user.preferences and user.preferences.genres:
        genres = [g.strip().capitalize() for g in user.preferences.genres.split(',')]
        if genres and random.random() > 0.5: # 50% chance to generate recommendation
            genre = random.choice(genres)
            db.session.add(Notification(user_id=user.id, title="Algorithm Suggestion", message=f"Based on your directives, we recommend exploring top-rated {genre} titles in the Discover tab.", type="recommendation"))

# ==========================================
# 3. API ROUTES
# ==========================================
@app.route('/api/status', methods=['GET'])
def health_check():
    return jsonify({"status": "Online"}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already in use"}), 409
    
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
        streak_milestone = False

        # Secure Server-Side Streak Processing
        if user.last_login_date != today:
            if user.last_login_date == today - timedelta(days=1):
                user.current_streak += 1
            else:
                user.current_streak = 1
                
            user.last_login_date = today
            if user.current_streak > user.highest_streak:
                user.highest_streak = user.current_streak
            
            # Daily Login XP + Milestone Bonuses
            daily_reward = 10
            user.xp += daily_reward
            if user.current_streak % 7 == 0:
                daily_reward += 50
                user.xp += 50
                streak_milestone = True
                db.session.add(Notification(user_id=user.id, title="Streak Milestone", message=f"Flawless {user.current_streak}-day operation streak! +50 Bonus XP awarded.", type="activity"))
            
            # Trigger Smart Notifications Engine on new daily login
            generate_smart_notifications(user)
            db.session.commit()

        return jsonify({
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
    notifs = Notification.query.filter_by(user_id=get_jwt_identity()).order_by(Notification.created_at.desc()).limit(20).all()
    return jsonify([{"id": n.id, "title": n.title, "message": n.message, "type": n.type, "is_read": n.is_read, "date": n.created_at.strftime("%Y-%m-%d")} for n in notifs]), 200

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
# 5. REMAINING CORE ROUTES
# ==========================================
@app.route('/api/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    current_user_id = get_jwt_identity()
    users = User.query.order_by(User.xp.desc(), User.current_streak.desc()).limit(100).all()
    
    leaderboard_data = []
    for index, u in enumerate(users):
        g_state = calculate_gamification_state(u.xp)
        leaderboard_data.append({
            "rank": index + 1,
            "id": u.id,
            "username": u.username,
            "avatar_url": u.avatar_url,
            "level": g_state["level"],
            "xp": u.xp,
            "streak": u.current_streak,
            "is_current_user": u.id == current_user_id
        })
        
    return jsonify(leaderboard_data), 200

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
        
        if new_status == 'Completed' and not item.xp_awarded:
            xp_gained = 100
            user.xp += xp_gained
            item.xp_awarded = True
            db.session.add(Notification(user_id=user.id, title="Mission Accomplished", message=f"You completed '{item.game_name}'. +100 XP awarded.", type="activity"))
        elif new_status != 'Completed' and item.xp_awarded:
            user.xp = max(0, user.xp - 100)
            item.xp_awarded = False

        item.status = new_status
        db.session.commit()
        
        new_level = calculate_gamification_state(user.xp)["level"]
        level_up = new_level > initial_level

        return jsonify({
            "message": "Status updated", 
            "gamification": {
                "xp_gained": xp_gained,
                "level_up": level_up,
                "new_level": new_level
            }
        }), 200
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Asset expunged"}), 200

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' not in request.files: return jsonify({"error": "No visual data detected"}), 400
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename): return jsonify({"error": "Invalid file"}), 400
    filename = secure_filename(f"user_{get_jwt_identity()}_{file.filename}")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({"url": f"/static/uploads/{filename}", "message": "Visual data secured"}), 201

@app.route('/static/uploads/<filename>')
def serve_uploaded_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)