import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, FileDown, CheckCircle2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/reservations/admin/reservations`;

const AdminTicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef();
  const token = localStorage.getItem("token");

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger la réservation sélectionnée
  const fetchReservation = async () => {
    try {
      const res = await axios.get(`${API_BASE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = res.data.find((r) => r._id === id);
      setReservation(found || null);
    } catch (err) {
      console.error("Erreur chargement réservation :", err);
      Swal.fire("Erreur", "Impossible de charger le billet.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background-light dark:bg-background-dark text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-primary" />
        Chargement du billet...
      </div>
    );

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background-light dark:bg-background-dark text-center">
        <p className="text-gray-500 mb-3">Aucune réservation trouvée.</p>
        <button
          onClick={() => navigate("/admin/reservations")}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Retour
        </button>
      </div>
    );
  }

  const { trajet, seat, date, user, statut } = reservation;

  // ✅ Télécharger en image
  const handleDownloadImage = async () => {
    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = `ticket-${trajet.villeDepart}-${trajet.villeArrivee}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ✅ Télécharger en PDF
  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`ticket-${trajet.villeDepart}-${trajet.villeArrivee}.pdf`);
  };

  // ✅ Validation à l'embarquement
  const handleValidate = async () => {
    const ask = await Swal.fire({
      title: "Valider à l’embarquement ?",
      text: "Cette action confirmera que le passager est monté dans le bus.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Valider",
      cancelButtonText: "Annuler",
    });

    if (!ask.isConfirmed) return;

    try {
      await axios.put(`${API_BASE}/${id}/validate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("Validée ✅", "Le billet a été validé à l’embarquement.", "success");
      fetchReservation();
    } catch (err) {
      console.error("Erreur validation :", err);
      Swal.fire("Erreur", "Impossible de valider l’embarquement.", "error");
    }
  };

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* 🔙 Retour */}
        <button
          onClick={() => navigate("/admin/reservations")}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux réservations
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-text-light dark:text-text-dark text-center"
        >
          🎫 Détail du billet
        </motion.h1>

        {/* 🧾 Ticket principal */}
        <motion.div
          ref={ticketRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

          {/* Logo & en-tête */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-primary">Kocrou Transport</h2>
              <p className="text-gray-500 text-sm">www.kocroutransport.ci</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <QRCodeCanvas
                value={`TICKET-${trajet.villeDepart}-${trajet.villeArrivee}-SEAT${seat}`}
                size={100}
                bgColor="transparent"
                fgColor={
                  document.documentElement.classList.contains("dark")
                    ? "#ffffff"
                    : "#000000"
                }
              />
            </div>
          </div>

          {/* Ligne principale */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">Client :</p>
            <h3 className="text-lg font-semibold text-text-light dark:text-white mb-2">
              {user?.name || "Utilisateur supprimé"}
            </h3>

            <div className="border-t border-dashed border-gray-400 my-4"></div>

            <p className="text-gray-600 dark:text-gray-300">
              <strong>Départ :</strong> {trajet.villeDepart} ({trajet.heureDepart})
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Arrivée :</strong> {trajet.villeArrivee}{" "}
              {trajet.heureArrivee && `(${trajet.heureArrivee})`}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Siège :</strong> #{seat}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Date :</strong> {new Date(date).toLocaleDateString("fr-FR")}
            </p>

            <div className="mt-3 text-primary font-bold text-xl">
              {trajet.prix.toLocaleString()} FCFA
            </div>

            <p
              className={`mt-4 text-sm font-semibold ${
                statut === "validée"
                  ? "text-blue-600"
                  : statut === "confirmée"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Statut : {statut.toUpperCase()}
            </p>
          </div>

          {/* Ligne de détachement */}
          <div className="my-6 border-t-2 border-dashed border-gray-300 relative">
            <span className="absolute -top-3 left-0 w-5 h-5 bg-background-light dark:bg-background-dark rounded-full"></span>
            <span className="absolute -top-3 right-0 w-5 h-5 bg-background-light dark:bg-background-dark rounded-full"></span>
          </div>

          {/* Code de réservation */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Code : <span className="font-mono font-bold text-primary">
              {`KOC-${trajet.villeDepart.substring(0, 3).toUpperCase()}-${trajet.villeArrivee
                .substring(0, 3)
                .toUpperCase()}-${seat}`}
            </span>
          </div>
        </motion.div>

        {/* 📥 Actions */}
        <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
          {statut === "confirmée" && (
            <button
              onClick={handleValidate}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition"
            >
              <CheckCircle2 className="w-5 h-5" /> Valider à l’embarquement
            </button>
          )}

          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            <Download className="w-5 h-5" /> Télécharger (Image)
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition"
          >
            <FileDown className="w-5 h-5" /> Exporter PDF
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminTicketView;
