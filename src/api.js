import axios from 'axios';

// All traffic now flows securely through your local Flask proxy
const BASE_URL = 'http://localhost:5000/api';

/**
 * Attaches the JWT to the request headers if the user is logged in.
 * This allows the backend to know the user's age for content filtering.
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches the global discovery feed of games.
 * Used in: Discover.jsx
 */
export const fetchGames = async (page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/games?page=${page}`, { 
      headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
};

/**
 * Fetches all details, platforms, and media for a single specific game.
 * Used in: GameDetail.jsx
 */
export const fetchGameDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/games/${id}`);
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
    const response = await axios.get(`${BASE_URL}/games?search=${query}&page=${page}`, { 
      headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching games with query "${query}":`, error);
    throw error;
  }
};