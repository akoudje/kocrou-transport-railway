// client/src/utils/api.js
import axios from "axios";
import Swal from "sweetalert2";

// 🌍 Base API URL : dynamique selon l'environnement
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

// ⚠️ Intercepteur de réponse global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si pas de réponse (ex: backend down)
    if (!error.response) {
      Swal.fire({
        icon: "error",
        title: "Serveur injoignable",
        text: "Impossible de contacter le serveur. Vérifiez votre connexion Internet ou réessayez plus tard.",
        confirmButtonColor: "#2563eb",
      });
      console.error("❌ Erreur réseau:", error.message);
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message =
      error.response.data?.message ||
      "Une erreur est survenue lors de la communication avec le serveur.";

    // 🔐 Token expiré ou invalide
    if (status === 401) {
      Swal.fire({
        icon: "warning",
        title: "Session expirée",
        text: "Veuillez vous reconnecter pour continuer.",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin-login";
      });
    }

    // 🔍 Ressource non trouvée
    else if (status === 404) {
      Swal.fire({
        icon: "info",
        title: "Non trouvé",
        text: "La ressource demandée est introuvable.",
        confirmButtonColor: "#2563eb",
      });
    }

    // ⚙️ Erreur serveur
    else if (status >= 500) {
      Swal.fire({
        icon: "error",
        title: "Erreur serveur",
        text: "Le serveur a rencontré une erreur. Réessayez plus tard.",
        confirmButtonColor: "#2563eb",
      });
    }

    console.error(`❌ Erreur API [${status}]:`, message);
    return Promise.reject(error);
  }
);

export default api;
