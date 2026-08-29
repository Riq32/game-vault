from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Gamification State
    xp = db.Column(db.Integer, default=0, nullable=False)
    current_streak = db.Column(db.Integer, default=0, nullable=False)
    highest_streak = db.Column(db.Integer, default=0, nullable=False)
    last_login_date = db.Column(db.Date, nullable=True)
    last_rank = db.Column(db.Integer, default=0, nullable=False) # Tracks leaderboard movement
    
    vault_items = db.relationship('VaultItem', backref='user', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='author', lazy=True, cascade='all, delete-orphan')
    preferences = db.relationship('Preference', backref='user', uselist=False, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')

class Notification(db.Model):
    __tablename__ = 'notification'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), default='system') # vault, activity, achievement, leaderboard, recommendation, reminder
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class VaultItem(db.Model):
    __tablename__ = 'vault_item'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, nullable=False)
    game_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Backlog')
    added_date = db.Column(db.DateTime, default=datetime.utcnow)
    xp_awarded = db.Column(db.Boolean, default=False, nullable=False)

class Review(db.Model):
    __tablename__ = 'review'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Preference(db.Model):
    __tablename__ = 'preference'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    platforms = db.Column(db.String(500), nullable=True)
    genres = db.Column(db.String(500), nullable=True)