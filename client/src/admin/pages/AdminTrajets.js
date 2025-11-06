import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Trash2, Bus, RefreshCw, CheckCircle2 } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/trajets`;

const AdminTrajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    lignePrincipale: { depart: "", arrivee: "", prix: "" },
    dateDepart: "",
    heureDepart: "",
    heureArrivee: "",
    totalPlaces: "",
    segments: [],
  });

  const token = localStorage.getItem("token");

  // 🔹 Récupération des trajets existants
  const fetchTrajets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTrajets(res.data);
    } catch (err) {
      console.error("Erreur récupération trajets :", err);
      setError("Impossible de charger les trajets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, []);

  // 🔹 Gestion des changements de formulaire
  const handleChange = (e, field, subField = null) => {
    if (subField) {
      setForm((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subField]: e.target.value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  // 🔹 Gestion des segments
  const addSegment = () => {
    setForm((prev) => ({
      ...prev,
      segments: [...prev.segments, { depart: "", arrivee: "", prix: "" }],
    }));
  };

  const updateSegment = (index, key, value) => {
    const updatedSegments = [...form.segments];
    updatedSegments[index][key] = value;
    setForm((prev) => ({ ...prev, segments: updatedSegments }));
  };

  const removeSegment = (index) => {
    setForm((prev) => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index),
    }));
  };

  // 🔹 Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.lignePrincipale.depart || !form.lignePrincipale.arrivee) {
      return setError("Les villes de départ et d’arrivée principales sont obligatoires.");
    }

    try {
      const res = await axios.post(API_URL, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Trajet créé avec succès ✅");
      setForm({
        lignePrincipale: { depart: "", arrivee: "", prix: "" },
        dateDepart: "",
        heureDepart: "",
        heureArrivee: "",
        totalPlaces: "",
        segments: [],
      });
      fetchTrajets();
    } catch (err) {
      console.error("Erreur création trajet :", err);
      setError("Erreur lors de la création du trajet !");
    }
  };

  // 🔹 Suppression
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce trajet ?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrajets();
    } catch (err) {
      console.error("Erreur suppression :", err);
      setError("Impossible de supprimer ce trajet !");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-background-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark flex items-center gap-2">
          <Bus className="text-primary" /> Gestion des Trajets
        </h1>
        <button
          onClick={fetchTrajets}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* 🔔 Messages */}
      {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4">{error}</p>}
      {success && (
        <p className="text-green-600 bg-green-100 dark:bg-green-900/30 p-3 rounded mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {success}
        </p>
      )}

      {/* 🧾 Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-card-dark rounded-xl shadow-md p-6 mb-8 space-y-4"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ville de départ *</label>
            <input
              type="text"
              value={form.lignePrincipale.depart}
              onChange={(e) => handleChange(e, "lignePrincipale", "depart")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
              placeholder="Ex : Abidjan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ville d’arrivée *</label>
            <input
              type="text"
              value={form.lignePrincipale.arrivee}
              onChange={(e) => handleChange(e, "lignePrincipale", "arrivee")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
              placeholder="Ex : Bouaké"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prix principal</label>
            <input
              type="number"
              value={form.lignePrincipale.prix}
              onChange={(e) => handleChange(e, "lignePrincipale", "prix")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
              placeholder="Ex : 10000"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date de départ</label>
            <input
              type="date"
              value={form.dateDepart}
              onChange={(e) => handleChange(e, "dateDepart")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heure de départ</label>
            <input
              type="time"
              value={form.heureDepart}
              onChange={(e) => handleChange(e, "heureDepart")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Heure d’arrivée (facultative)
            </label>
            <input
              type="time"
              value={form.heureArrivee}
              onChange={(e) => handleChange(e, "heureArrivee")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Places totales</label>
            <input
              type="number"
              value={form.totalPlaces}
              onChange={(e) => handleChange(e, "totalPlaces")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800"
              placeholder="Ex : 55"
            />
          </div>
        </div>

        {/* 🧩 Segments optionnels */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold">Segments (optionnels)</h3>
            <button
              type="button"
              onClick={addSegment}
              className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 text-sm"
            >
              <Plus className="w-4 h-4" /> Ajouter un segment
            </button>
          </div>

          {form.segments.length === 0 && (
            <p className="text-gray-400 italic">Aucun segment ajouté.</p>
          )}

          {form.segments.map((segment, i) => (
            <div
              key={i}
              className="grid md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-2"
            >
              <input
                type="text"
                placeholder="Départ"
                value={segment.depart}
                onChange={(e) => updateSegment(i, "depart", e.target.value)}
                className="border p-2 rounded-lg dark:bg-gray-700"
              />
              <input
                type="text"
                placeholder="Arrivée"
                value={segment.arrivee}
                onChange={(e) => updateSegment(i, "arrivee", e.target.value)}
                className="border p-2 rounded-lg dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Prix"
                value={segment.prix}
                onChange={(e) => updateSegment(i, "prix", e.target.value)}
                className="border p-2 rounded-lg dark:bg-gray-700"
              />
              <button
                type="button"
                onClick={() => removeSegment(i)}
                className="flex items-center justify-center text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-4 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Enregistrer le trajet
        </button>
      </form>

      {/* 📋 Liste des trajets existants */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">Trajets enregistrés</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : trajets.length === 0 ? (
          <p className="text-gray-500 italic">Aucun trajet pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {trajets.map((t) => (
              <li
                key={t._id}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
              >
                <span>
                  🚍 {t.lignePrincipale.depart} → {t.lignePrincipale.arrivee}{" "}
                  <span className="text-sm text-gray-400 ml-2">
                    ({t.totalPlaces} places)
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AdminTrajets;

