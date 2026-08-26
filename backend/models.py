from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize the SQLAlchemy instance
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships (If a user is deleted, delete their associated data)
    preferences = db.relationship('Preference', backref='user', uselist=False, cascade='all, delete-orphan')
    vault_items = db.relationship('VaultItem', backref='user', cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', cascade='all, delete-orphan')

class Preference(db.Model):
    __tablename__ = 'preferences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # Using JSON columns to store arrays of platforms and genres
    platforms = db.Column(db.JSON, nullable=True) 
    genres = db.Column(db.JSON, nullable=True)

class VaultItem(db.Model):
    __tablename__ = 'vault_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_id = db.Column(db.String(50), nullable=False) # The RAWG API Game ID
    game_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='Backlog') # 'Playing', 'Completed', 'Backlog'
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_id = db.Column(db.String(50), nullable=False) # The RAWG API Game ID
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)