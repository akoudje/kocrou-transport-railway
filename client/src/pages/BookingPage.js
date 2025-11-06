import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Bus } from "lucide-react";
import Swal from "sweetalert2";
import SeatGrid from "../components/SeatGrid";
import api from "../utils/api"; // ✅ instance Axios configurée (avec token automatique)

const BookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const trajet = state?.trajet;

  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSeats, setTotalSeats] = useState(50);

  // ✅ Charger les sièges déjà réservés
  useEffect(() => {
    const fetchReservedSeats = async () => {
      if (!trajet?._id) return;
      try {
        const { data } = await api.get(`/reservations/trajet/${trajet._id}`);
        setReservedSeats(data.map((r) => r.seat));
      } catch (err) {
        console.error("Erreur récupération sièges :", err);
      }
    };
    fetchReservedSeats();

    // ✅ Déterminer dynamiquement le nombre total de sièges
    if (trajet?.nombrePlaces && Number(trajet.nombrePlaces) > 0) {
      setTotalSeats(Math.min(Number(trajet.nombrePlaces), 60));
    } else {
      setTotalSeats(50); // valeur par défaut
    }
  }, [trajet]);

  // ✅ Sélection / désélection d’un siège
  const toggleSeat = (seat) => {
    if (reservedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  // ✅ Validation de la réservation
  const handleReservation = async () => {
    if (selectedSeats.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Aucun siège sélectionné",
        text: "Veuillez sélectionner au moins un siège avant de continuer.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/reservations", {
        trajet,
        seats: selectedSeats,
      });

      Swal.fire({
        icon: "success",
        title: "Réservation confirmée ✅",
        text: `Vous avez réservé ${selectedSeats.length} siège(s).`,
        confirmButtonColor: "#16a34a",
        timer: 2500,
      });

      navigate("/confirmation", { state: { reservations: data.reservations } });
    } catch (err) {
      console.error("Erreur réservation :", err);
      Swal.fire({
        icon: "error",
        title: "Erreur de réservation",
        text:
          err.response?.data?.message ||
          "Impossible d'effectuer la réservation pour le moment.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!trajet) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        Trajet introuvable.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* ✅ Titre responsive (non coupé) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-8 text-text-light dark:text-text-dark 
                     flex flex-wrap justify-center items-center gap-2 text-center leading-snug"
        >
          <Bus className="w-7 h-7 text-primary flex-shrink-0" />
          <span className="max-w-full break-words">
            Réservation pour {trajet.villeDepart} → {trajet.villeArrivee}
          </span>
        </motion.h1>

        {/* 🪑 Grille dynamique des sièges */}
        <div className="flex justify-center mt-8">
          <SeatGrid
            totalSeats={totalSeats}
            reservedSeats={reservedSeats}
            selectedSeats={selectedSeats}
            toggleSeat={toggleSeat}
            showLegend={true}
          />
        </div>

        {/* 🧾 Bouton de confirmation */}
        <div className="mt-10">
          <button
            onClick={handleReservation}
            disabled={loading}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold 
                       hover:bg-primary/90 disabled:opacity-70 transition flex justify-center mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin inline w-5 h-5 mr-2" />
                Réservation en cours...
              </>
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
