import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";


const API = axios.create({
  baseURL: `${API_BASE}/api`, // ton backend
});

// Intercepteur : ajoute automatiquement le token JWT dans le header
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
