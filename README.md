# 🎮 GameVault

GameVault is a sleek, high-contrast digital library designed for PC and console gamers to discover new releases and seamlessly organize their gaming backlog. 

This application was developed as a Phase 1 capstone project by Enrique Pim.

## 🎯 The Problem & Solution
Gamers frequently buy titles across multiple platforms, lose track of their digital libraries, and suffer from choice paralysis when deciding what to play next. 

GameVault solves this by providing a unified, visually appealing dashboard powered by the RAWG Video Games Database API. Users can search for games, view high-resolution metadata, and categorize their personal library to always know exactly what masterpiece awaits them next.

## ✨ Features
*   **Immersive Landing Experience:** A dynamic hero section introducing the core capabilities of the application.
*   **Discover & Filter:** Browse trending games and filter through a massive catalog by genre.
*   **Deep-Dive Metadata:** View high-resolution screenshots, release dates, descriptions, and Metacritic scores for millions of titles.
*   **Library Management:** Save games to local storage and categorize them by status: *Want to Play*, *Currently Playing*, *Completed*, or *Dropped*.
*   **High-Contrast UI:** Fully responsive, Apple-inspired interface featuring a custom dark/light mode toggle that overrides system preferences.

## 🛠️ Tech Stack
*   **Frontend Framework:** React (with `react-router-dom` for client-side routing)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS v4 (utilizing custom `@theme` configurations)
*   **State Management:** Native React Hooks (`useState`, `useEffect`) and custom hooks (`useBacklog`, `useFetch`, `useTheme`) paired with browser `localStorage`.
*   **External API:** RAWG Video Games Database API
*   **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need a free API key from [RAWG](https://rawg.io/apidocs).

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/game-vault.git](https://github.com/yourusername/game-vault.git)
   cd game-vault

## 🌐 Phase 2: Full-Stack Production Architecture

The application has evolved into a comprehensive full-stack architecture, engineered as a Moringa Phase 2 project. This phase transitions the application from a local client-side tool into a robust, cloud-deployed production environment.

### 🛠️ Phase 2 Tech Stack

**Client-Side (Frontend)**
*   **React 18 + Vite:** Lightning-fast rendering and build tooling.
*   **Tailwind CSS v4:** Utility-first styling for a sleek, high-contrast interface.
*   **Framer Motion:** Integrated for kinetic UI components, interactive splash animations, and onboarding filters.
*   **Axios:** Promise-based HTTP client for seamless backend communication.
*   **Vercel:** Edge-network deployment for the client application.

**Server-Side (Backend)**
*   **Python 3 & Flask:** Lightweight, highly customizable RESTful API framework.
*   **Gunicorn:** Production-grade Python WSGI HTTP Server.
*   **PostgreSQL:** Relational database for persistent user data (configured with local SQLite fallback).
*   **SQLAlchemy:** Object Relational Mapper (ORM) for database schema modeling.
*   **Flask-Bcrypt & Flask-JWT-Extended:** Secure password hashing and stateless token-based authentication.
*   **OpenAI API:** Neural link integration for server-side Japanese localization of game descriptions.
*   **Render:** Fully managed cloud deployment for the backend web service and PostgreSQL database.

### 🔄 CRUD Operations & API Methods

Phase 2 implements full CRUD (Create, Read, Update, Delete) capabilities to manage global data, user identities, and personalized vaults:

*   **CREATE (POST)**
    *   `/api/register`: Creates new user identities, securely hashing passwords with bcrypt.
    *   `/api/login`: Authenticates users and generates JWT access tokens.
    *   `/api/vault`: Adds a new game to the user's personal backlog.
    *   `/api/reviews`: Submits a new user review and rating for a specific game.
    *   `/api/preferences`: Saves hardware and genre preferences during onboarding.

*   **READ (GET)**
    *   `/api/games`: Fetches the global transmission feed of games (proxied from RAWG). Includes pagination and search queries.
    *   `/api/games/<id>`: Retrieves deep-dive metadata for a specific title.
    *   `/api/profile`: Decrypts the JWT to fetch the current user's profile, vault statistics, and join date.
    *   `/api/vault`: Retrieves all saved games associated with the authenticated user.
    *   `/api/recommendations`: Calculates algorithmic matches based on the user's saved preferences.

*   **UPDATE (PUT)**
    *   `/api/profile`: Modifies user identity parameters (display name, email, avatar URL).
    *   `/api/vault/<id>`: Updates the tracking status of a saved game (e.g., shifting from "Backlog" to "Completed").

*   **DELETE (DELETE)**
    *   `/api/vault/<id>`: Permanently removes a game from the user's vault.

### 🛡️ Phase 2 Architectural Advancements

1.  **Resilient RAWG Proxy:** The backend acts as a secure proxy for the RAWG API, stripping away CORS restrictions and hiding the API key. It features an automated fallback mechanism that serves local mock data if the RAWG servers time out, ensuring UI stability.
2.  **Stateless Authentication:** Transitioned from local storage faux-auth to secure, JWT-based routing.
3.  **AI Localization:** Implemented a `/api/translate` route that leverages OpenAI (`gpt-3.5-turbo`) to translate raw HTML game descriptions into Japanese while preserving semantic markup perfectly.   