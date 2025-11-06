import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, UserPlus, Bus, XCircle, Loader2 } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/notifications`;
const SOCKET_URL = API_BASE;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Connexion Socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("✅ Connecté à Socket.io (admin)");
    });

    socket.on("new_reservation", (data) => {
      setNotifications((prev) => [
        { type: "reservation", message: `Nouvelle réservation : ${data.userName} pour ${data.segment.depart} → ${data.segment.arrivee}`, time: new Date() },
        ...prev,
      ]);
    });

    socket.on("reservation_cancelled", (data) => {
      setNotifications((prev) => [
        { type: "cancel", message: `Réservation annulée par ${data.userName}`, time: new Date() },
        ...prev,
      ]);
    });

    socket.on("new_user", (data) => {
      setNotifications((prev) => [
        { type: "user", message: `Nouvel utilisateur : ${data.name} (${data.email})`, time: new Date() },
        ...prev,
      ]);
    });

    // Nettoyage à la déconnexion
    return () => {
      socket.disconnect();
    };
  }, []);

  // 🔹 Fallback HTTP : charger les dernières notifications au montage
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Erreur chargement notifications :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "reservation":
        return <Bus className="text-primary w-6 h-6" />;
      case "cancel":
        return <XCircle className="text-red-500 w-6 h-6" />;
      case "user":
        return <UserPlus className="text-green-500 w-6 h-6" />;
      default:
        return <Bell className="text-gray-400 w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
        Chargement des notifications...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-6 bg-white dark:bg-card-dark rounded-xl shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-primary w-7 h-7" />
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Notifications en temps réel
        </h2>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Aucune notification récente pour le moment 🔕
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notif, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 py-4"
            >
              <div>{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(notif.time).toLocaleString("fr-FR")}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default AdminNotifications;
