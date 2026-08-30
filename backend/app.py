# ==========================================
# IDENTITY & AUTHENTICATION ROUTES
# ==========================================

@app.route('/api/status', methods=['GET', 'OPTIONS'])
def health_check():
    return jsonify({"status": "Online"}), 200

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    
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
    
    # 🛡️ THE FIX: str(new_user.id) forces the integer ID into a string format for JWT
    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        "token": access_token, 
        "username": new_user.username, 
        "full_name": new_user.full_name
    }), 201

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        # 🛡️ THE FIX: str(user.id) forces the integer ID into a string format for JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "token": access_token, 
            "username": user.username, 
            "full_name": user.full_name
        }), 200
        
    return jsonify({"error": "Invalid credentials"}), 401