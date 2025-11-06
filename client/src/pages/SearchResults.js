// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, Loader2, MapPin } from "lucide-react";


const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/trajets`;


const SearchResults = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const depart = params.get("depart") || "";
  const arrivee = params.get("arrivee") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.get(API_URL, { params: { depart, arrivee } });
        setResults(data || []);
      } catch (err) {
        console.error("Erreur chargement trajets :", err);
        setError("Impossible de charger les trajets. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [depart, arrivee]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background-light dark:bg-background-dark text-center">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-3" />
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Recherche des trajets disponibles...
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-text-light dark:text-text-dark"
        >
          <span className="text-primary font-extrabold">
            {depart} → {arrivee}
          </span>{" "}
          — Résultats
        </motion.h1>

        {error && (
          <p className="text-red-500 bg-red-100 dark:bg-red-900/40 p-3 rounded-md mb-4">
            {error}
          </p>
        )}

        {results.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            Aucun trajet trouvé pour cette recherche 😢
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((trajet) => (
              <TrajetCard key={trajet._id} trajet={trajet} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const TrajetCard = ({ trajet, navigate }) => {
  const [segment, setSegment] = useState(null);

  const handleSegmentChange = (e) => {
    const value = e.target.value;
    setSegment(value ? JSON.parse(value) : null);
  };

  const prixAffiche = (segment ? segment.prix : trajet.prixTotal || 0).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow hover:shadow-lg transition"
    >
      <div className="flex items-center gap-4">
        <Bus className="w-8 h-8 text-primary" />
        <div>
          {/* Trajet mis en avant */}
          <h3 className="font-extrabold text-xl text-text-light dark:text-text-dark">
            {trajet.lignePrincipale.depart} → {trajet.lignePrincipale.arrivee}
          </h3>
          {/* Compagnie en second */}
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-primary" />
            {trajet.compagnie}
          </p>
        </div>
      </div>

      {/* Choix du tronçon */}
      <div className="mt-4">
        <label className="block text-sm text-gray-600 mb-2">
          Choisissez un tronçon (optionnel) :
        </label>
        <select
          onChange={handleSegmentChange}
          className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-subtle-dark text-gray-700 dark:text-gray-200"
        >
          <option value="">— Trajet complet —</option>
          {(trajet.segments || []).map((s, i) => (
            <option key={i} value={JSON.stringify(s)}>
              {s.depart} → {s.arrivee} ({s.prix.toLocaleString()} FCFA)
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="font-semibold text-primary text-lg">{prixAffiche} FCFA</p>
        <button
          type="button"
          className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          onClick={() =>
            navigate(`/reservation/${trajet._id}`, {
              state: {
                trajet,
                segment: segment || {
                  depart: trajet.lignePrincipale.depart,
                  arrivee: trajet.lignePrincipale.arrivee,
                  prix: trajet.prixTotal,
                },
              },
            })
          }
        >
          Réserver
        </button>
      </div>
    </motion.div>
  );
};

export default SearchResults;

