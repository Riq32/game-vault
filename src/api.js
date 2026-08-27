import axios from 'axios';

// Vite accesses environment variables using import.meta.env
// Make sure VITE_RAWG_API_KEY is defined in your frontend .env file
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

/**
 * Fetches the global discovery feed of games.
 * Used in: Discover.jsx
 */
export const fetchGames = async (page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/games?key=${RAWG_API_KEY}&page_size=24&page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching games from RAWG:", error);
    throw error;
  }
};

/**
 * Fetches all details, platforms, and media for a single specific game.
 * Used in: GameDetail.jsx
 */
export const fetchGameDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for game ID ${id}:`, error);
    throw error;
  }
};

/**
 * Searches for games based on a user's text query.
 * Used in: Search.jsx
 */
export const searchGames = async (query, page = 1) => {
  try {
    // RAWG uses the &search= parameter to find specific titles
    const response = await axios.get(`${BASE_URL}/games?key=${RAWG_API_KEY}&search=${query}&page_size=24&page=${page}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching games with query "${query}":`, error);
    throw error;
  }
};