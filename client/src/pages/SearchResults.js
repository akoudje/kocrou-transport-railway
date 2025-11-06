import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, Loader2, MapPin } from "lucide-react";
import api from "../utils/api"; // ✅ Instance Axios configurée (token + baseURL auto)

const SearchResults = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const depart = params.get("depart") || "";
  const arrivee = params.get("arrivee") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Charger les trajets filtrés
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/trajets", {
          params: { depart, arrivee },
        });
        setResults(data || []);
      } catch (err) {
        console.error("Erreur chargement trajets :", err);
        setError("Impossible de charger les trajets. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [depart, arrivee]);

  // 🌀 État de chargement
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

  // ⚠️ Erreur
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <p className="text-red-500 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* 🔙 Retour à l’accueil */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>

        {/* 🧭 Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-text-light dark:text-text-dark text-center"
        >
          Trajets disponibles —{" "}
          <span className="text-primary font-extrabold">
            {depart} → {arrivee}
          </span>
        </motion.h1>

        {/* 🔹 Liste des résultats */}
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

export default SearchResults;

/* ------------------------------------------------------
 * 🧩 Composant : Carte d’un trajet individuel
 * ---------------------------------------------------- */
const TrajetCard = ({ trajet, navigate }) => {
  const [segment, setSegment] = useState(null);

  const handleSegmentChange = (e) => {
    const value = e.target.value;
    setSegment(value ? JSON.parse(value) : null);
  };

  // ✅ Prix affiché dynamiquement
  const prixAffiche = (segment ? segment.prix : trajet.prixTotal || 0).toLocaleString();

  // ✅ Nombre de places restantes (si fourni)
  const placesRestantes = trajet.placesRestantes ?? trajet.nombrePlaces ?? 0;

  const couleurDisponibilite =
    placesRestantes <= 5
      ? "text-red-500"
      : placesRestantes <= 10
      ? "text-orange-500"
      : "text-green-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow hover:shadow-lg transition"
    >
      {/* 🔹 En-tête du trajet */}
      <div className="flex items-center gap-4 mb-3">
        <Bus className="w-8 h-8 text-primary" />
        <div>
          <h3 className="font-extrabold text-xl text-text-light dark:text-text-dark">
            {trajet.lignePrincipale?.depart} → {trajet.lignePrincipale?.arrivee}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-primary" />
            {trajet.compagnie || "Kocrou Transport"}
          </p>
        </div>
      </div>

      {/* 🔽 Sélecteur de segment */}
      <div className="mt-3">
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

      {/* 💸 Prix + bouton */}
      <div className="mt-5 flex justify-between items-center flex-wrap gap-3">
        <div className="flex flex-col text-left">
          <p className="font-semibold text-primary text-lg">{prixAffiche} FCFA</p>
          <p className={`text-sm ${couleurDisponibilite}`}>
            {placesRestantes > 0
              ? `${placesRestantes} place${placesRestantes > 1 ? "s" : ""} restante${placesRestantes > 1 ? "s" : ""}`
              : "Complet ❌"}
          </p>
        </div>

        <button
          type="button"
          disabled={placesRestantes === 0}
          onClick={() =>
            navigate(`/reservation/${trajet._id}`, {
              state: {
                trajet,
                segment: segment || {
                  depart: trajet.lignePrincipale?.depart,
                  arrivee: trajet.lignePrincipale?.arrivee,
                  prix: trajet.prixTotal,
                },
              },
            })
          }
          className={`px-5 py-2 rounded-lg text-white font-medium transition ${
            placesRestantes === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {placesRestantes === 0 ? "Complet" : "Réserver"}
        </button>
      </div>
    </motion.div>
  );
};
