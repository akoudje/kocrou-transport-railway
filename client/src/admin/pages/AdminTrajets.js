// src/client/admin/pages/AdminTrajets.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Bus,
  MapPin,
  DollarSign,
  Loader2,
  Save,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/api"; // ✅ Import centralisé vers ton utilitaire axios

const AdminTrajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrajet, setEditingTrajet] = useState(null);
  const [form, setForm] = useState({
    compagnie: "",
    lignePrincipale: { depart: "", arrivee: "" },
    segments: [],
    prixTotal: "",
    nombrePlaces: 50,
  });

  const token = localStorage.getItem("token");

  // ✅ Charger les trajets
  const fetchTrajets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/trajets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrajets(data);
    } catch (err) {
      console.error("Erreur chargement trajets :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, []);

  // ✅ Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["depart", "arrivee"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        lignePrincipale: { ...prev.lignePrincipale, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Ajouter un segment
  const addSegment = () => {
    setForm((prev) => ({
      ...prev,
      segments: [
        ...prev.segments,
        { depart: "", arrivee: "", prix: "", duree: "" },
      ],
    }));
  };

  // ✅ Modifier un segment
  const handleSegmentChange = (index, field, value) => {
    const updatedSegments = [...form.segments];
    updatedSegments[index][field] = value;
    setForm((prev) => ({ ...prev, segments: updatedSegments }));
  };

  // ✅ Supprimer un segment
  const removeSegment = (index) => {
    const updatedSegments = form.segments.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, segments: updatedSegments }));
  };

  // ✅ Soumission (ajout ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.lignePrincipale.depart || !form.lignePrincipale.arrivee) {
      Swal.fire("Champs requis", "Veuillez indiquer le départ et l’arrivée.", "warning");
      return;
    }

    try {
      if (editingTrajet) {
        await api.put(`/trajets/${editingTrajet._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Modifié ✅", "Le trajet a été mis à jour.", "success");
      } else {
        await api.post("/trajets", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Ajouté ✅", "Le trajet a été créé avec succès.", "success");
      }
      setEditingTrajet(null);
      setForm({
        compagnie: "",
        lignePrincipale: { depart: "", arrivee: "" },
        segments: [],
        prixTotal: "",
        nombrePlaces: 50,
      });
      fetchTrajets();
    } catch (err) {
      console.error("Erreur sauvegarde trajet :", err);
      Swal.fire("Erreur", "Impossible d’enregistrer le trajet.", "error");
    }
  };

  // ✅ Édition
  const handleEdit = (trajet) => {
    setEditingTrajet(trajet);
    setForm({
      compagnie: trajet.compagnie,
      lignePrincipale: trajet.lignePrincipale,
      segments: trajet.segments || [],
      prixTotal: trajet.prixTotal,
      nombrePlaces: trajet.nombrePlaces || 50,
    });
  };

  // ✅ Suppression
  const handleDelete = async (trajetId) => {
    const ask = await Swal.fire({
      title: "Supprimer ce trajet ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!ask.isConfirmed) return;

    try {
      await api.delete(`/trajets/${trajetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Supprimé ✅", "Le trajet a été supprimé.", "success");
      fetchTrajets();
    } catch (err) {
      console.error("Erreur suppression trajet :", err);
      Swal.fire("Erreur", "Impossible de supprimer le trajet.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col">
        <main className="p-6 space-y-8">
          {/* Titre */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
              Gestion des trajets
            </h2>
            <button
              onClick={fetchTrajets}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
          </div>

          {/* Formulaire */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card-dark p-6 rounded-xl shadow space-y-5"
          >
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
              {editingTrajet ? "Modifier un trajet" : "Ajouter un trajet"}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="compagnie"
                placeholder="Nom de la compagnie"
                value={form.compagnie}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 w-full bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              />

              <input
                type="number"
                name="prixTotal"
                placeholder="Prix total (FCFA)"
                value={form.prixTotal}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 w-full bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              />

              <input
                type="text"
                name="depart"
                placeholder="Ville de départ"
                value={form.lignePrincipale.depart}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 w-full bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              />

              <input
                type="text"
                name="arrivee"
                placeholder="Ville d'arrivée"
                value={form.lignePrincipale.arrivee}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 w-full bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              />

              <input
                type="number"
                name="nombrePlaces"
                placeholder="Nombre de places"
                value={form.nombrePlaces}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 w-full bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Segments */}
            <div>
              <h4 className="font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
                Segments de trajet
              </h4>
              {form.segments.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-wrap md:flex-nowrap items-center gap-3 mb-2"
                >
                  <input
                    type="text"
                    placeholder="Départ"
                    value={s.depart}
                    onChange={(e) => handleSegmentChange(i, "depart", e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full md:w-1/4 bg-subtle-light dark:bg-subtle-dark"
                  />
                  <input
                    type="text"
                    placeholder="Arrivée"
                    value={s.arrivee}
                    onChange={(e) => handleSegmentChange(i, "arrivee", e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full md:w-1/4 bg-subtle-light dark:bg-subtle-dark"
                  />
                  <input
                    type="number"
                    placeholder="Prix"
                    value={s.prix}
                    onChange={(e) => handleSegmentChange(i, "prix", e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full md:w-1/4 bg-subtle-light dark:bg-subtle-dark"
                  />
                  <input
                    type="text"
                    placeholder="Durée"
                    value={s.duree}
                    onChange={(e) => handleSegmentChange(i, "duree", e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full md:w-1/4 bg-subtle-light dark:bg-subtle-dark"
                  />
                  <button
                    type="button"
                    onClick={() => removeSegment(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSegment}
                className="flex items-center gap-2 text-primary font-medium mt-2"
              >
                <Plus className="w-4 h-4" /> Ajouter un segment
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                <Save className="w-4 h-4" /> {editingTrajet ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </motion.form>

          {/* Liste des trajets */}
          <section className="bg-white dark:bg-card-dark p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">
              Liste des trajets
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-10 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
                Chargement des trajets...
              </div>
            ) : trajets.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                Aucun trajet enregistré.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 uppercase text-xs">
                      <th className="py-3 px-4">Compagnie</th>
                      <th className="py-3 px-4">Trajet</th>
                      <th className="py-3 px-4 text-center">Prix total</th>
                      <th className="py-3 px-4 text-center">Places</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trajets.map((t) => (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4">{t.compagnie}</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Bus className="w-4 h-4 text-primary" />
                          {t.lignePrincipale.depart} → {t.lignePrincipale.arrivee}
                        </td>
                        <td className="py-3 px-4 text-center text-primary font-semibold">
                          {t.prixTotal.toLocaleString()} FCFA
                        </td>
                        <td className="py-3 px-4 text-center">{t.nombrePlaces}</td>
                        <td className="py-3 px-4 text-center flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(t)}
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" /> Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminTrajets;
