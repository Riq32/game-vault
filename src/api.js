import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

export const fetchGameDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/games/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for game ID ${id}:`, error);
    throw error;
  }
};

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