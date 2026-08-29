import os
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.utils import secure_filename
import openai

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

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==========================================
# 2. DATABASE MODELS (ORM)
# ==========================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Gamification State
    xp = db.Column(db.Integer, default=0, nullable=False)
    
    vault_items = db.relationship('VaultItem', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='author', lazy=True)
    preferences = db.relationship('Preference', backref='user', uselist=False)

class VaultItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, nullable=False)
    game_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Backlog')
    added_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Gamification Tracking
    xp_awarded = db.Column(db.Boolean, default=False, nullable=False)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Preference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    platforms = db.Column(db.String(500), nullable=True)
    genres = db.Column(db.String(500), nullable=True)

with app.app_context():
    db.create_all()

# ==========================================
# 3. HELPER FUNCTIONS
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

# ==========================================
# 4. API ROUTES
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
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if request.method == 'GET':
        return jsonify({
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "join_date": user.join_date.strftime("%Y-%m-%d"),
            "gamification": calculate_gamification_state(user.xp),
            "stats": {
                "total": len(user.vault_items),
                "completed": len([i for i in user.vault_items if i.status == 'Completed']),
                "playing": len([i for i in user.vault_items if i.status == 'Playing']),
                "backlog": len([i for i in user.vault_items if i.status == 'Backlog'])
            }
        }), 200
        
    if request.method == 'PATCH':
        data = request.get_json()
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        db.session.commit()
        return jsonify({"message": "Identity updated successfully", "user": {"username": user.username}}), 200

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No visual data detected"}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file"}), 400
        
    filename = secure_filename(f"user_{get_jwt_identity()}_{file.filename}")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({"url": f"/static/uploads/{filename}", "message": "Visual data secured"}), 201

@app.route('/static/uploads/<filename>')
def serve_uploaded_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/preferences', methods=['POST'])
@jwt_required()
def save_preferences():
    user_id = get_jwt_identity()
    data = request.get_json()
    pref = Preference.query.filter_by(user_id=user_id).first() or Preference(user_id=user_id)
    db.session.add(pref)
    pref.platforms = ",".join(data.get('platforms', []))
    pref.genres = ",".join(data.get('genres', []))
    db.session.commit()
    return jsonify({"message": "Directives saved"}), 200

@app.route('/api/games', methods=['GET'])
def get_games():
    page, search = request.args.get('page', 1), request.args.get('search', '')
    url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&page={page}&page_size=20" + (f"&search={search}" if search else "")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except:
        return jsonify({"results": [{"id": 1, "name": "System Override", "rating": 5.0, "released": "2026-01-01"}]}), 200

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game_details(game_id):
    try:
        response = requests.get(f"https://api.rawg.io/api/games/{game_id}?key={RAWG_API_KEY}", timeout=10)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except:
        return jsonify({"error": "Not found"}), 404

@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    pref = Preference.query.filter_by(user_id=get_jwt_identity()).first()
    tags = pref.genres.split(',')[0].lower() if pref and pref.genres else "singleplayer"
    try:
        response = requests.get(f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&tags={tags}&ordering=-rating&page_size=4", timeout=10)
        return jsonify(response.json().get('results', [])), 200
    except:
        return jsonify([]), 200

@app.route('/api/vault', methods=['GET', 'POST'])
@jwt_required()
def handle_vault():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        items = VaultItem.query.filter_by(user_id=user_id).order_by(VaultItem.added_date.desc()).all()
        return jsonify([{"id": i.id, "game_id": i.game_id, "game_name": i.game_name, "status": i.status} for i in items]), 200
        
    data = request.get_json()
    if VaultItem.query.filter_by(user_id=user_id, game_id=data.get('game_id')).first():
        return jsonify({"error": "Asset exists"}), 409
    db.session.add(VaultItem(user_id=user_id, game_id=data.get('game_id'), game_name=data.get('game_name')))
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
        
        # XP Distribution Logic
        if new_status == 'Completed' and not item.xp_awarded:
            user.xp += 100
            item.xp_awarded = True
        elif new_status != 'Completed' and item.xp_awarded:
            user.xp = max(0, user.xp - 100)
            item.xp_awarded = False

        item.status = new_status
        db.session.commit()
        return jsonify({"message": "Status updated"}), 200
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Asset expunged"}), 200

@app.route('/api/reviews', methods=['POST'])
@jwt_required()
def post_review():
    data = request.get_json()
    new_review = Review(user_id=get_jwt_identity(), game_id=data.get('game_id'), rating=data.get('rating'), text=data.get('text'))
    db.session.add(new_review)
    db.session.commit()
    return jsonify({"message": "Logged", "review": {"id": new_review.id, "user": new_review.author.username, "rating": new_review.rating, "text": new_review.text, "date": new_review.created_at.strftime("%Y-%m-%d")}}), 201

@app.route('/api/reviews/<int:game_id>', methods=['GET'])
def get_reviews(game_id):
    return jsonify([{"id": r.id, "user": r.author.username, "rating": r.rating, "text": r.text, "date": r.created_at.strftime("%Y-%m-%d")} for r in Review.query.filter_by(game_id=game_id).order_by(Review.created_at.desc()).all()]), 200

@app.route('/api/translate', methods=['POST'])
def translate_description():
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Translate the following HTML description into Japanese. Preserve all HTML tags perfectly."},
                {"role": "user", "content": request.get_json().get('text', '')}
            ],
            max_tokens=1000, temperature=0.3
        )
        return jsonify({"translated_text": response.choices[0].message.content.strip()}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)