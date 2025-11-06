import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Trash2,
  Bus,
  CalendarDays,
  MapPin,
  Ticket,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../utils/api"; // ✅ instance Axios configurée

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Charger les réservations utilisateur
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reservations");
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // ✅ Suppression avec confirmation SweetAlert2
  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Supprimer cette réservation ?",
      text: "Cette action est définitive. Votre réservation sera supprimée du système et ne pourra plus être récupérée.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer définitivement",
      cancelButtonText: "Annuler",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await api.delete(`/reservations/${id}`);

      await Swal.fire({
        title: "Réservation supprimée ✅",
        text: "Votre réservation a été effacée définitivement du système.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });

      fetchReservations(); // 🔄 rafraîchir la liste
    } catch (err) {
      console.error("Erreur suppression réservation :", err);
      Swal.fire({
        title: "Erreur",
        text: "Impossible d'annuler cette réservation pour le moment.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // 🌀 État de chargement
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background-light dark:bg-background-dark text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-primary" />
        Chargement de vos réservations...
      </div>
    );
  }

  // ⚠️ En cas d’erreur
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchReservations}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-text-light dark:text-text-dark text-center"
        >
          🧾 Mes Réservations
        </motion.h1>

        {reservations.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Vous n'avez aucune réservation enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-5">
            {reservations.map((res) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-card-dark p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                {/* 🚌 Infos principales */}
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <Bus className="text-primary w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-text-light dark:text-text-dark">
                      {res.trajet?.compagnie || "Kocrou Transport"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      {res.trajet?.villeDepart} → {res.trajet?.villeArrivee}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Siège : <strong>#{res.seat}</strong>
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />{" "}
                      {new Date(res.date).toLocaleString("fr-FR")}
                    </p>
                    <p
                      className={`text-xs mt-1 font-semibold ${
                        res.statut === "confirmée"
                          ? "text-green-600"
                          : res.statut === "validée"
                          ? "text-blue-600"
                          : "text-red-500"
                      }`}
                    >
                      {res.statut === "confirmée"
                        ? "✔️ Confirmée"
                        : res.statut === "validée"
                        ? "🟢 Validée à l’embarquement"
                        : "❌ Annulée"}
                    </p>
                  </div>
                </div>

                {/* 💳 Actions */}
                <div className="flex flex-col md:flex-row items-center gap-3 mt-4 md:mt-0">
                  {/* Voir le ticket */}
                  <button
                    onClick={() =>
                      navigate("/confirmation", { state: { reservation: res } })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
                  >
                    <Ticket className="w-4 h-4" /> Voir le ticket
                  </button>

                  {/* Retour à l’accueil */}
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                               text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 
                               dark:hover:bg-gray-600 transition"
                  >
                    <Home className="w-4 h-4" /> Accueil
                  </button>

                  {/* Annuler la réservation */}
                  {res.statut === "confirmée" && (
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-400 
                                 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 
                                 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Annuler
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReservationsPage;

