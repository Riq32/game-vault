import os
import requests
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, User, Preference, VaultItem, Review
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from openai import OpenAI

# Explicitly load the backend .env file from the current directory
load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key') 

db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/api/status', methods=['GET'])
def system_status():
    return jsonify({"status": "operational", "database": "connected"}), 200

# ==========================================
# AUTHENTICATION & REGISTRATION
# ==========================================
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    dob_str = data.get('dob')

    if not username or not password or not dob_str:
        return jsonify({"error": "Username, password, and Date of Birth are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password, date_of_birth=dob)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "message": "Identity created", 
        "access_token": access_token, 
        "user": {"id": new_user.id, "username": new_user.username}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password')):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful", 
        "access_token": access_token, 
        "user": {
            "id": user.id, 
            "username": user.username,
            "displayName": user.display_name,
            "profilePic": user.profile_pic
        }
    }), 200

# ==========================================
# UNRESTRICTED RAWG PROXY (WITH DEBUG TRACE)
# ==========================================
@app.route('/api/games', methods=['GET'])
def get_games():
    rawg_key = os.getenv('RAWG_API_KEY')
    
    # Secure diagnostic trace to verify key injection in terminal console
    print(f"\n[DEBUG] Loaded RAWG_API_KEY: {rawg_key[:5] if rawg_key else 'NONE'}********\n")

    page = request.args.get('page', 1)
    search = request.args.get('search', '')
    
    url = f"https://api.rawg.io/api/games?key={rawg_key}&page_size=24&page={page}"
    if search:
        url += f"&search={search}"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status() 
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        print(f"\n[RAWG API ERROR DETECTED]: {e}\n")
        return jsonify({"error": "Failed to connect to RAWG."}), 502
    except ValueError:
        print("\n[RAWG API ERROR DETECTED]: Received non-JSON response payload.\n")
        return jsonify({"error": "Invalid data from RAWG."}), 502

@app.route('/api/games/<game_id>', methods=['GET'])
def get_game_details(game_id):
    rawg_key = os.getenv('RAWG_API_KEY')
    try:
        response = requests.get(f"https://api.rawg.io/api/games/{game_id}?key={rawg_key}", timeout=15)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        print(f"\n[RAWG API ERROR DETECTED]: {e}\n")
        return jsonify({"error": "Failed to fetch game details."}), 502
    except ValueError:
        return jsonify({"error": "Invalid data from RAWG."}), 502

# ==========================================
# PROFILE & SETTINGS ROUTES
# ==========================================
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    pref = Preference.query.filter_by(user_id=current_user_id).first()
    vault_items = VaultItem.query.filter_by(user_id=current_user_id).all()
    
    stats = {
        "total": len(vault_items),
        "completed": sum(1 for item in vault_items if item.status == 'Completed'),
        "playing": sum(1 for item in vault_items if item.status == 'Playing'),
        "backlog": sum(1 for item in vault_items if item.status == 'Backlog')
    }

    return jsonify({
        "username": user.username,
        "displayName": user.display_name,
        "email": user.email,
        "profilePic": user.profile_pic,
        "joinDate": user.created_at.strftime("%B %Y"),
        "platforms": pref.platforms if pref and pref.platforms else [],
        "stats": stats
    }), 200

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_email = data.get('email')

    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email is already registered to another identity."}), 409

    user.display_name = data.get('displayName')
    user.email = new_email
    user.profile_pic = data.get('profilePic')
    db.session.commit()

    return jsonify({
        "message": "Profile identity updated securely.",
        "user": {
            "id": user.id,
            "username": user.username,
            "displayName": user.display_name,
            "profilePic": user.profile_pic
        }
    }), 200

@app.route('/api/preferences', methods=['POST'])
@jwt_required()
def save_preferences():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    pref = Preference.query.filter_by(user_id=current_user_id).first()
    if pref:
        pref.platforms = data.get('platforms', [])
        pref.genres = data.get('genres', [])
    else:
        pref = Preference(user_id=current_user_id, platforms=data.get('platforms', []), genres=data.get('genres', []))
        db.session.add(pref)

    db.session.commit()
    return jsonify({"message": "Preferences saved successfully securely in the vault."}), 200

# ==========================================
# VAULT & REVIEW ROUTES
# ==========================================
@app.route('/api/vault', methods=['GET', 'POST'])
@jwt_required()
def handle_vault():
    current_user_id = get_jwt_identity()

    if request.method == 'GET':
        items = VaultItem.query.filter_by(user_id=current_user_id).order_by(VaultItem.added_at.desc()).all()
        return jsonify([{"id": i.id, "game_id": i.game_id, "game_name": i.game_name, "status": i.status} for i in items]), 200

    if request.method == 'POST':
        data = request.get_json()
        existing = VaultItem.query.filter_by(user_id=current_user_id, game_id=str(data.get('game_id'))).first()
        if existing:
            return jsonify({"error": "Game already in vault"}), 409

        new_item = VaultItem(user_id=current_user_id, game_id=str(data.get('game_id')), game_name=data.get('game_name'), status='Backlog')
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": f"{data.get('game_name')} added to vault!"}), 201

@app.route('/api/vault/<int:item_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_vault_item(item_id):
    current_user_id = get_jwt_identity()
    item = VaultItem.query.filter_by(id=item_id, user_id=current_user_id).first()

    if not item: return jsonify({"error": "Item not found"}), 404

    if request.method == 'PUT':
        new_status = request.get_json().get('status')
        if new_status in ['Backlog', 'Playing', 'Completed']:
            item.status = new_status
            db.session.commit()
            return jsonify({"message": "Status updated", "status": item.status}), 200
        return jsonify({"error": "Invalid status"}), 400

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item removed"}), 200

@app.route('/api/reviews/<game_id>', methods=['GET'])
def get_reviews(game_id):
    reviews = db.session.query(Review, User)\
        .join(User)\
        .filter(Review.game_id == str(game_id))\
        .order_by(Review.created_at.desc()).all()
    
    return jsonify([{
        "id": r.Review.id, 
        "user": r.User.display_name or r.User.username, 
        "rating": r.Review.rating, 
        "text": r.Review.text, 
        "date": r.Review.created_at.strftime("%b %d, %Y")
    } for r in reviews]), 200

@app.route('/api/reviews', methods=['POST'])
@jwt_required()
def post_review():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    new_review = Review(user_id=current_user_id, game_id=str(data.get('game_id')), rating=data.get('rating', 5), text=data.get('text'))
    db.session.add(new_review)
    db.session.commit()

    user = User.query.get(current_user_id)
    return jsonify({"message": "Review transmitted", "review": {
        "id": new_review.id, "user": user.display_name or user.username, "rating": new_review.rating, 
        "text": new_review.text, "date": new_review.created_at.strftime("%b %d, %Y")
    }}), 201

# ==========================================
# RECOMMENDATIONS & AI
# ==========================================
@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    current_user_id = get_jwt_identity()
    pref = Preference.query.filter_by(user_id=current_user_id).first()
    rawg_key = os.getenv('RAWG_API_KEY')

    if not pref or not rawg_key: return jsonify([]), 200 

    RAWG_GENRE_MAP = {'Action': '4', 'RPG': '5', 'Shooter': '2', 'Adventure': '3', 'Strategy': '10', 'Arcade': '11', 'Puzzle': '7', 'Racing': '1', 'Sports': '15', 'Fighting': '6', 'Simulation': '14', 'Platformer': '83'}
    RAWG_PLATFORM_MAP = {'PS5': '187', 'PS4': '18', 'Xbox Series X': '186', 'Xbox Series S': '186', 'Xbox One': '1', 'Switch': '7', 'Windows PC': '4'}

    genre_ids = [RAWG_GENRE_MAP[g] for g in pref.genres if g in RAWG_GENRE_MAP]
    platform_ids = [RAWG_PLATFORM_MAP[p] for p in pref.platforms if p in RAWG_PLATFORM_MAP]

    url = f"https://api.rawg.io/api/games?key={rawg_key}&ordering=-rating&page_size=4"
    if genre_ids: url += f"&genres={','.join(genre_ids)}"
    if platform_ids: url += f"&platforms={','.join(platform_ids)}"

    try:
        response = requests.get(url, timeout=15)
        return jsonify(response.json().get('results', [])), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/translate', methods=['POST'])
def translate_text():
    text_to_translate = request.get_json().get('text')
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key or "your-actual" in api_key:
        return jsonify({"translated_text": "<p>【シミュレーション翻訳】このゲームは素晴らしいです！信じられないほどのグラフィックと没入感のあるストーリー。</p>"}), 200

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional video game localization AI. Translate the following HTML-formatted game description into Japanese. You MUST maintain all HTML tags perfectly intact."},
                {"role": "user", "content": text_to_translate}
            ]
        )
        return jsonify({"translated_text": response.choices[0].message.content}), 200
    except Exception:
        return jsonify({"translated_text": "<p>【シミュレーション翻訳】このゲームは素晴らしいです！信じられないほどのグラフィックと没入感のあるストーリー。</p>"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)