# 🎮 GameVault

GameVault is a sleek, high-contrast digital library designed for PC and console gamers to discover new releases and seamlessly organize their gaming backlog. 

This application was developed as a Phase 1 capstone project by Mwapahe Moses Chengo.

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