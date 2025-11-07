import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Download, Home } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

const ConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const reservations = state?.reservations || [];
  const reservation = state?.reservation; // compatibilité ancienne version
  const list = reservations.length > 0 ? reservations : reservation ? [reservation] : [];

  if (list.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Aucune donnée trouvée",
      text: "Impossible d'afficher la confirmation. Veuillez vérifier vos réservations.",
      confirmButtonColor: "#dc2626",
    });
    navigate("/");
    return null;
  }

  // ✅ Téléchargement PDF du ticket
  const handleDownloadPDF = async (id) => {
    const ticketElement = document.getElementById(`ticket-${id}`);
    if (!ticketElement) return;

    const canvas = await html2canvas(ticketElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 15, 15, imgWidth, imgHeight);
    pdf.save(`Ticket_${id}.pdf`);
  };

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center mb-10 text-text-light dark:text-text-dark"
      >
        🎟️ Confirmation de réservation
      </motion.h1>

      <div className="max-w-5xl mx-auto flex flex-col gap-8 items-center">
        {list.map((res, index) => (
          <motion.div
            key={res._id || index}
            id={`ticket-${res._id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative bg-white dark:bg-card-dark rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Bande supérieure stylisée */}
            <div className="bg-primary text-white py-3 px-5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Bus className="w-6 h-6" />
                Kocrou Transport
              </div>
              <span className="text-sm opacity-90">
                {new Date(res.dateReservation || res.date).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {/* Contenu principal */}
            <div className="p-6 text-gray-800 dark:text-gray-100">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xl font-bold text-primary">
                    {res.trajet?.villeDepart} → {res.trajet?.villeArrivee}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {res.trajet?.compagnie || "Kocrou Transport"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Siège</p>
                  <p className="text-xl font-bold">#{res.seat}</p>
                </div>
              </div>

              {/* Ligne de détachement */}
              <div className="border-t border-dashed border-gray-400 my-4" />

              {/* QR code + infos supplémentaires */}
              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Départ :</span>{" "}
                    {res.trajet?.heureDepart || "—"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Arrivée :</span>{" "}
                    {res.trajet?.heureArrivee || "—"}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">Prix :</span>{" "}
                    {res.trajet?.prix?.toLocaleString() || "—"} FCFA
                  </p>
                  <p
                    className={`text-sm mt-2 font-semibold ${
                      res.statut === "validée"
                        ? "text-blue-600"
                        : res.statut === "annulée"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {res.statut === "validée"
                      ? "🟢 Validée à l’embarquement"
                      : res.statut === "annulée"
                      ? "❌ Annulée"
                      : "✔️ Confirmée"}
                  </p>
                </div>

                {/* QR code du billet */}
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg shadow-inner">
                  <QRCodeCanvas
                    value={JSON.stringify({
                      id: res._id,
                      trajet: `${res.trajet?.villeDepart} → ${res.trajet?.villeArrivee}`,
                      seat: res.seat,
                    })}
                    size={80}
                    bgColor="transparent"
                    fgColor="#111"
                    level="M"
                  />
                </div>
              </div>
            </div>

            {/* Barre d’action */}
            <div className="bg-gray-100 dark:bg-gray-800 flex justify-between items-center py-3 px-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleDownloadPDF(res._id)}
                className="flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <Download className="w-5 h-5" /> Télécharger
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition"
              >
                <Home className="w-5 h-5" /> Accueil
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ConfirmationPage;





