import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/auth/login`;

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(API_URL, form);

      // ✅ Vérifie si l'utilisateur est admin
      if (!data.user.isAdmin) {
        setError("Accès refusé : compte non autorisé pour l'administration.");
        setLoading(false);
        return;
      }

      // ✅ Stocke le token et les infos admin
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirection vers le tableau de bord admin
      navigate("/admin");
    } catch (err) {
      console.error("Erreur connexion admin :", err);
      setError(
        err.response?.data?.message ||
          "Erreur de connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-card-dark shadow-2xl rounded-2xl p-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="w-12 h-12 text-primary mb-3" />
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
            Connexion Administrateur
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Accédez au tableau de bord Kocrou
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
              placeholder="admin@kocrou.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/40 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition flex justify-center items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Kocrou Transport — Espace Administrateur
        </p>
      </motion.div>
    </section>
  );
};

export default AdminLogin;
// End of recent edits