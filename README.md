# 🎮 GameVault

**Phase 1: React Capstone Project**  
GameVault is a sleek, consumer-facing video game discovery and backlog management platform powered by the RAWG API. 

## 🎯 Problem Statement & User Persona
Gamers often struggle to track the games they want to play across different platforms or forget titles they bought on sale. **The User** is a PC or console gamer who needs a unified, visually appealing library to discover trending titles, look up Metacritic scores, and organize a personal backlog.

## ✨ Features (Phase 1)
- **Dynamic Discovery:** Browse trending and top-rated games.
- **Robust Search:** Search for specific titles with debounced API calls.
- **Deep Dive Details:** View high-res screenshots, HTML-parsed descriptions, and publisher data.
- **Local Backlog (Preview):** Save games to a local Wishlist/Backlog (preparing for Phase 2 DB integration).
- **Graceful Error Handling:** Custom loading spinners, empty states, and API error boundaries.

## 🛠 Tech Stack
- **Frontend:** React 18 (Vite), React Router v6
- **Styling:** Tailwind CSS (Dark Mode UI)
- **Data Source:** [RAWG Video Games Database API](https://rawg.io/apidocs)

## 🚀 Setup Instructions
1. Clone the repository: `git clone <repo-url>`
2. Navigate to the project folder: `cd game-vault`
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory and add your RAWG API key:
   ```env
   VITE_RAWG_API_KEY=your_api_key_here