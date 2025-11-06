// client/src/utils/api.js
import axios from "axios";

// 🌍 Base API URL : dynamique selon l'environnement
const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://kocrou-transport-server.onrender.com" // ← ton URL Render backend
    : "http://localhost:5000");

// 🧩 Configuration Axios par défaut
const api = axios.create({
  baseURL: API_BASE + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Ajouter automatiquement le token JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
