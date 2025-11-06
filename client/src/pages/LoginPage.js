import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const LoginPage = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  // ✅ Soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login(email, password);

    if (success) {
      Swal.fire({
        icon: "success",
        title: "Connexion réussie 🎉",
        text: "Bienvenue à bord !",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(from, { replace: true });
    } else {
      Swal.fire({
        icon: "error",
        title: "Échec de la connexion",
        text: "Vérifiez vos identifiants et réessayez.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-2xl shadow-xl p-8"
      >
        {/* 🚍 Logo et titre */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Bus className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Kocrou Transport</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Connectez-vous pour continuer votre voyage 🚍
          </p>
        </div>

        {/* 🧾 Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ex: jean.konan@email.com"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary 
                         focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary 
                         focus:outline-none transition"
            />
          </div>

          {/* Message d’erreur éventuel du contexte */}
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* 🔘 Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 
                       flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* 🔗 Lien d’inscription */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Créez-en un ici
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Kocrou Transport. Tous droits réservés.
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
