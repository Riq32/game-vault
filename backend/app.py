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

# Database Configuration (Falls back to local SQLite if no cloud URL is provided)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///vault.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Security & API Keys
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secure-dev-key-123')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
RAWG_API_KEY = os.getenv('RAWG_API_KEY')
openai.api_key = os.getenv('OPENAI_API_KEY')

# Image Upload Configuration
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 # 5MB limit to prevent server overload

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
    
    vault_items = db.relationship('VaultItem', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='author', lazy=True)
    preferences = db.relationship('Preference', backref='user', uselist=False)

class VaultItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, nullable=False)
    game_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Backlog') # Backlog, Playing, Completed
    added_date = db.Column(db.DateTime, default=datetime.utcnow)

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
    platforms = db.Column(db.String(500), nullable=True) # Stored as comma-separated
    genres = db.Column(db.String(500), nullable=True)    # Stored as comma-separated

# Auto-initialize schema on server boot
with app.app_context():
    db.create_all()

# ==========================================
# 3. HELPER FUNCTIONS
# ==========================================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==========================================
# 4. API ROUTES
# ==========================================

@app.route('/api/status', methods=['GET'])
def health_check():
    return jsonify({"status": "Online", "message": "Game Vault Server is actively transmitting."}), 200

# --- IDENTITY & AUTHENTICATION ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already in use"}), 409
    
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(username=data.get('username'), email=data.get('email'), password_hash=hashed_pw)
    
    db.session.add(new_user)
    db.session.commit()
    
    token = create_access_token(identity=new_user.id)
    return jsonify({"token": token, "username": new_user.username}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        token = create_access_token(identity=user.id)
        return jsonify({"token": token, "username": user.username}), 200
        
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/profile', methods=['GET', 'PUT'])
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
            "vault_count": len(user.vault_items)
        }), 200
        
    if request.method == 'PUT':
        data = request.get_json()
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        if 'username' in data:
            user.username = data['username']
        db.session.commit()
        return jsonify({"message": "Identity updated successfully", "avatar_url": user.avatar_url}), 200

# --- FILE UPLOADS ---

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No visual data detected in transmission"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{get_jwt_identity()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_url = f"/static/uploads/{filename}"
        return jsonify({"url": file_url, "message": "Visual data secured"}), 201
        
    return jsonify({"error": "Invalid format. Allowed: PNG, JPG, WEBP, GIF"}), 400

@app.route('/static/uploads/<filename>')
def serve_uploaded_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- PREFERENCES & ONBOARDING ---

@app.route('/api/preferences', methods=['POST'])
@jwt_required()
def save_preferences():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    pref = Preference.query.filter_by(user_id=user_id).first()
    if not pref:
        pref = Preference(user_id=user_id)
        db.session.add(pref)
        
    pref.platforms = ",".join(data.get('platforms', []))
    pref.genres = ",".join(data.get('genres', []))
    db.session.commit()
    
    return jsonify({"message": "Directives saved successfully"}), 200

# --- RESILIENT RAWG PROXY ---

@app.route('/api/games', methods=['GET'])
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
        # Automated Mock Fallback Data to prevent UI crashing
        return jsonify({
            "results": [
                {"id": 1, "name": "System Override (Fallback)", "rating": 5.0, "released": "2026-01-01"},
                {"id": 2, "name": "Neural Link Severed", "rating": 0.0, "released": "Unknown"}
            ]
        }), 200

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game_details(game_id):
    try:
        response = requests.get(f"https://api.rawg.io/api/games/{game_id}?key={RAWG_API_KEY}", timeout=10)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException:
        return jsonify({"error": "Target intellectual property not found."}), 404

@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    pref = Preference.query.filter_by(user_id=user_id).first()
    
    # Default tags if no preferences exist
    tags = "singleplayer"
    if pref and pref.genres:
        first_genre = pref.genres.split(',')[0].lower()
        tags = first_genre

    try:
        url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&tags={tags}&ordering=-rating&page_size=4"
        response = requests.get(url, timeout=10)
        return jsonify(response.json().get('results', [])), 200
    except:
        return jsonify([]), 200

# --- VAULT (LIBRARY) MANAGEMENT ---

@app.route('/api/vault', methods=['GET', 'POST'])
@jwt_required()
def handle_vault():
    user_id = get_jwt_identity()
    
    if request.method == 'GET':
        items = VaultItem.query.filter_by(user_id=user_id).order_by(VaultItem.added_date.desc()).all()
        return jsonify([{
            "id": item.id,
            "game_id": item.game_id,
            "game_name": item.game_name,
            "status": item.status
        } for item in items]), 200
        
    if request.method == 'POST':
        data = request.get_json()
        # Prevent duplicates
        if VaultItem.query.filter_by(user_id=user_id, game_id=data.get('game_id')).first():
            return jsonify({"error": "Asset already exists in vault"}), 409
            
        new_item = VaultItem(
            user_id=user_id,
            game_id=data.get('game_id'),
            game_name=data.get('game_name')
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": "Asset secured in vault"}), 201

@app.route('/api/vault/<int:item_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modify_vault_item(item_id):
    user_id = get_jwt_identity()
    item = VaultItem.query.filter_by(id=item_id, user_id=user_id).first()
    
    if not item:
        return jsonify({"error": "Item not found"}), 404
        
    if request.method == 'PUT':
        data = request.get_json()
        item.status = data.get('status', item.status)
        db.session.commit()
        return jsonify({"message": "Status updated"}), 200
        
    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Asset expunged from vault"}), 200

# --- REVIEWS ---

@app.route('/api/reviews', methods=['POST'])
@jwt_required()
def post_review():
    user_id = get_jwt_identity()
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

@app.route('/api/reviews/<int:game_id>', methods=['GET'])
def get_reviews(game_id):
    reviews = Review.query.filter_by(game_id=game_id).order_by(Review.created_at.desc()).all()
    return jsonify([{
        "id": r.id,
        "user": r.author.username,
        "rating": r.rating,
        "text": r.text,
        "date": r.created_at.strftime("%Y-%m-%d")
    } for r in reviews]), 200

# --- AI NEURAL LINK (LOCALIZATION) ---

@app.route('/api/translate', methods=['POST'])
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
        translated_text = response.choices[0].message.content.strip()
        return jsonify({"translated_text": translated_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)