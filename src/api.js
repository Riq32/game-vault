const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

const fetcher = async (endpoint) => {
  const url = endpoint.includes('?') 
    ? `${BASE_URL}${endpoint}&key=${API_KEY}` 
    : `${BASE_URL}${endpoint}?key=${API_KEY}`;
    
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
};

export const fetchGenres = () => fetcher('/genres?page_size=20');

export const fetchTrendingGames = (genreId = '') => {
  let endpoint = '/games?ordering=-rating&page_size=20';
  if (genreId) endpoint += `&genres=${genreId}`;
  return fetcher(endpoint);
};

export const searchGames = (query) => fetcher(`/games?search=${encodeURIComponent(query)}&page_size=20`);
export const fetchGameDetails = (id) => fetcher(`/games/${id}`);
export const fetchGameScreenshots = (id) => fetcher(`/games/${id}/screenshots`);