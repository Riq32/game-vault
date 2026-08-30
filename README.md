# Game Vault

**A Full-Stack Capstone Project**

Game Vault is a centralized, gamified platform designed to help players track their video game backlogs, discover new titles, and engage with a community of fellow gamers. Built as a comprehensive Phase 3 Capstone Project, it bridges a dynamic React frontend with a robust, secure Flask backend to deliver a production-ready application.

This repository contains the complete frontend and backend codebase, demonstrating secure JWT-based user authentication, protected data management, external API integrations, and immersive UI/UX design.

---

## 🎯 The Business Problem & Solution

**The Problem:**
Modern gamers interact with countless gaming ecosystems (Steam, PlayStation, Xbox, Nintendo) but lack a unified, engaging platform to track their personal backlogs, discover critically acclaimed titles based on their specific preferences, and share reviews without dealing with fragmented, cluttered interfaces.

**The Solution:**
Game Vault serves as a single, secure nexus. It allows "Operatives" (users) to register securely, build a personalized tracking network (The Vault), earn XP and climb a global leaderboard for completing games, and interact with an AI-powered localization engine for international game data. It transforms backlog management from a chore into a rewarding, gamified experience.

---

## ✨ Core Features

### Security & Authentication

* **JWT Token-Based Auth:** Secure registration and login workflows using `Flask-JWT-Extended` and `bcrypt` password hashing.
* **Protected Routes:** Both frontend React components and backend Flask endpoints are secured, ensuring users can only modify their own vault items, preferences, and profile data.
* **Axios Interceptors:** Automated token attachment and silent session cleanup on token expiration.

### User-Owned Data & Relationships (Data Models)

* **Personalized Vaults (One-to-Many):** Users can add games to their backlog, update statuses (Playing, Completed), and remove them.
* **Player Comm-Link (Reviews):** Users can leave star ratings and text reviews on specific games.
* **Smart Directives (Preferences):** Users can save their favorite genres and platforms to receive algorithmic game matches.
* **Notification System:** Real-time, user-specific notifications for leveling up, streak bonuses, and AI recommendations.

### Advanced Integrations

* **RAWG API:** Live fetching of global video game data, marketplace links, screenshots, and metadata.
* **OpenAI API:** Integrated localization engine allowing users to instantly translate complex game descriptions into Japanese while preserving HTML formatting.
* **File Uploads:** Secure multipart form data handling for custom user profile avatars.
* **Gamification Engine:** Automated XP distribution, daily login streaks, and a dynamic top-100 global leaderboard.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| --- | --- |
| **Frontend** | React, React Router, Tailwind CSS, Framer Motion, Lucide React, Axios |
| **Backend** | Python, Flask, Flask-SQLAlchemy, Flask-Bcrypt, Flask-JWT-Extended |
| **Database** | SQLite (Development) / PostgreSQL (Production) |
| **External APIs** | RAWG Video Games Database API, OpenAI API (gpt-3.5-turbo) |
| **Deployment** | Vercel (Frontend), Render (Backend Web Service) |

---

## 🗄️ Backend API Architecture

All backend endpoints are cleanly namespaced under `/api` to prevent routing conflicts with the React frontend during production deployment.

* **Auth:** `POST /api/register`, `POST /api/login`
* **User:** `GET /api/profile`, `PATCH /api/profile`
* **Vault Data:** `GET /api/vault`, `POST /api/vault`, `PATCH /api/vault/<id>`, `DELETE /api/vault/<id>`
* **Social/Reviews:** `GET /api/reviews/<game_id>`, `POST /api/reviews`
* **Gamification:** `GET /api/leaderboard`, `GET /api/notifications`
* **External/AI:** `GET /api/games`, `POST /api/translate`

---

## 🚀 Setup & Installation Instructions

To run Game Vault locally, you will need two terminal windows—one for the Flask backend and one for the React frontend.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/game-vault.git
cd game-vault

```

### 2. Backend Setup (Flask)

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file in the backend directory and add the following:
SECRET_KEY=your_super_secret_jwt_key
RAWG_API_KEY=your_rawg_api_key
OPENAI_API_KEY=your_openai_api_key

# Initialize the database and run the server
python app.py

```

*The Flask server will start on `http://localhost:5000`.*

### 3. Frontend Setup (React)

Open a new terminal window.

```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev

```

*The React app will typically start on `http://localhost:5173`. Axios is configured to point requests to the backend server.*

---

## 🌍 Deployment

Game Vault is engineered for cloud deployment:

* **Backend:** Configured for Render using Gunicorn as the WSGI HTTP server (`gunicorn app:app`).
* **Frontend:** Configured for Vercel.
* *Note on CORS:* The Flask application utilizes `flask-cors` to explicitly allow communication from the frontend domain, ensuring smooth cross-origin requests.

---

**Architected by Enrique Pim**

*Capstone Project — Demonstrating full-stack proficiency, RESTful API design, database modeling, and secure access control.*