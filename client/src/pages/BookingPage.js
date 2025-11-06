// client/src/pages/BookingPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Bus } from "lucide-react";
import SeatGrid from "../components/SeatGrid";

const BookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const trajet = state?.trajet;

  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSeats, setTotalSeats] = useState(50);

  const token = localStorage.getItem("token");
  
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const API_URL = `${API_BASE}/api/reservations`;

  // ✅ Charger les sièges réservés
  useEffect(() => {
    const fetchReservedSeats = async () => {
      if (!trajet?._id) return;
      try {
        const { data } = await axios.get(
          `${API_URL}/trajet/${trajet._id}`
        );
        setReservedSeats(data.map((r) => r.seat));
      } catch (err) {
        console.error("Erreur récupération sièges :", err);
      }
    };
    fetchReservedSeats();

    // ✅ Déterminer dynamiquement le nombre de places
    if (trajet?.nombrePlaces && Number(trajet.nombrePlaces) > 0) {
      setTotalSeats(Math.min(trajet.nombrePlaces, 60)); // cap à 60
    } else {
      setTotalSeats(50); // valeur par défaut
    }
  }, [trajet]);

  // ✅ Sélection de siège
  const toggleSeat = (seat) => {
    if (reservedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  // ✅ Réservation
  const handleReservation = async () => {
    if (selectedSeats.length === 0) {
      alert("Veuillez sélectionner au moins un siège.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "${API_BASE}/api/reservations",
        {
          trajet,
          seats: selectedSeats,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/confirmation", { state: { reservations: data.reservations } });
    } catch (err) {
      console.error("Erreur réservation :", err);
      alert(
        err.response?.data?.message ||
          "Impossible d'effectuer la réservation."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!trajet) {
    return (
      <div className="text-center py-20 text-gray-500">
        Trajet introuvable.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* ✅ Titre corrigé (non coupé) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-6 text-text-light dark:text-text-dark 
                     text-center flex justify-center items-center gap-2 flex-wrap whitespace-normal break-words leading-snug"
        >
          <Bus className="w-6 h-6 text-primary flex-shrink-0" />
          <span className="max-w-full text-balance">
            Réservation pour {trajet.villeDepart} → {trajet.villeArrivee}
          </span>
        </motion.h1>

        {/* 🪑 Grille dynamique */}
        <div className="flex justify-center mt-8">
          <SeatGrid
            totalSeats={totalSeats}
            reservedSeats={reservedSeats}
            selectedSeats={selectedSeats}
            toggleSeat={toggleSeat}
            showLegend={true}
          />
        </div>

        {/* 🧾 Bouton */}
        <div className="mt-10">
          <button
            onClick={handleReservation}
            disabled={loading}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-70 transition"
          >
            {loading ? (
              <Loader2 className="animate-spin inline w-5 h-5" />
            ) : (
              "Confirmer la réservation"
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookingPage;
