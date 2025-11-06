// client/src/admin/pages/AdminReservations.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Trash2,
  CalendarDays,
  Bus,
  MapPin,
  Search,
  Filter,
  Ticket,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/reservations`;
const API_GET_ALL = `${API_URL}/admin/reservations`;
const API_CANCEL = (id) => `${API_URL}/admin/reservations/${id}/cancel`;
const API_VALIDATE = (id) => `${API_URL}/admin/reservations/${id}/validate`;

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
      setError("Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // temps réel
    const socket = io("${API_BASE}", { transports: ["websocket"] });
    socket.on("reservation_created", () => fetchReservations());
    socket.on("reservation_updated", () => fetchReservations());
    socket.on("reservation_deleted", () => fetchReservations());
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    const ask = await Swal.fire({
      title: "Annuler cette réservation ?",
      text: "Cette action marquera la réservation comme annulée.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, annuler",
      cancelButtonText: "Non",
    });
    if (!ask.isConfirmed) return;

    try {
      await axios.put(
        API_CANCEL(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Annulée", "La réservation a été annulée.", "success");
      fetchReservations();
    } catch (err) {
      console.error("Erreur annulation :", err);
      Swal.fire("Erreur", "Impossible d’annuler la réservation.", "error");
    }
  };

  const handleValidate = async (id) => {
    const ask = await Swal.fire({
      title: "Valider à l’embarquement ?",
      text: "Le billet sera marqué comme utilisé/embarqué.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Valider",
      cancelButtonText: "Annuler",
    });
    if (!ask.isConfirmed) return;

    try {
      await axios.put(
        API_VALIDATE(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire(
        "Validée",
        "La réservation a été validée à l’embarquement ✅",
        "success"
      );
      fetchReservations();
    } catch (err) {
      console.error("Erreur validation :", err);
      Swal.fire("Erreur", "Impossible de valider l’embarquement.", "error");
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchSearch =
        search.trim() === "" ||
        res.trajet?.compagnie?.toLowerCase().includes(search.toLowerCase()) ||
        res.trajet?.villeDepart?.toLowerCase().includes(search.toLowerCase()) ||
        res.trajet?.villeArrivee
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        res.user?.name?.toLowerCase().includes(search.toLowerCase());

      const matchDate =
        !filterDate ||
        new Date(res.date).toLocaleDateString("fr-CA") === filterDate;

      const matchStatut =
        filterStatut === "Tous" || res.statut === filterStatut.toLowerCase();

      return matchSearch && matchDate && matchStatut;
    });
  }, [reservations, search, filterDate, filterStatut]);

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-background-dark">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Réservations clients
        </h2>
        <button
          onClick={fetchReservations}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* 🔍 Filtres */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par compagnie, ville ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="relative flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary outline-none"
        >
          <option>Tous</option>
          <option>Confirmée</option>
          <option>Validée</option>
          <option>Annulée</option>
        </select>
      </div>

      {/* 📋 Tableau */}
      {loading ? (
        <p className="text-gray-500">Chargement des réservations...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredReservations.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          Aucune réservation trouvée.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-card-dark rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 uppercase text-xs">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Trajet</th>
                <th className="py-3 px-4 text-center">Prix</th>
                <th className="py-3 px-4 text-center">Siège</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <motion.tr
                  key={res._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="py-3 px-4">
                    {res.user?.name || "Utilisateur supprimé"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Bus className="w-4 h-4 text-primary" />
                      <span>
                        {res.trajet?.villeDepart} → {res.trajet?.villeArrivee}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {res.trajet?.compagnie}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">
                    {res.trajet?.prix?.toLocaleString() || 0} FCFA
                  </td>
                  <td className="py-3 px-4 text-center">#{res.seat}</td>
                  <td className="py-3 px-4 text-center text-gray-400">
                    <CalendarDays className="w-3 h-3 inline mr-1" />
                    {res.dateReservation ? new Date(res.dateReservation).toLocaleDateString( "fr-FR" )  : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {res.statut === "validée" ? (
                      <span className="text-blue-600 font-semibold">
                        Validée
                      </span>
                    ) : res.statut === "confirmée" ? (
                      <span className="text-green-600 font-semibold">
                        Confirmée
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Annulée
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-3">
                      {/* Voir billet */}
                      <button
                        onClick={() => navigate(`/admin/ticket/${res._id}`)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        title="Voir le billet"
                      >
                        <Ticket className="w-4 h-4" /> Billet
                      </button>

                      {/* Valider à l’embarquement */}
                      {res.statut === "confirmée" && (
                        <button
                          onClick={() => handleValidate(res._id)}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1"
                          title="Valider à l’embarquement"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Valider
                        </button>
                      )}

                      {/* Annuler */}
                      {res.statut === "confirmée" && (
                        <button
                          onClick={() => handleCancel(res._id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          title="Annuler"
                        >
                          <Trash2 className="w-4 h-4" /> Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
