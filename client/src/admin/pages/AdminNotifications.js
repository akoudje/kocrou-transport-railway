import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Trash2, Loader2, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import api from "../../utils/api";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_URL ||
  "https://kocrou-transport-server.onrender.com";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // 🧠 Charger les notifications existantes
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data.reverse());
    } catch (err) {
      console.error("Erreur chargement notifications :", err);
      Swal.fire("Erreur", "Impossible de charger les notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ⚡ Initialisation Socket.io
  useEffect(() => {
    fetchNotifications();

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => console.log("🟢 Connecté au WebSocket"));
    socket.on("disconnect", () => console.log("🔴 Déconnecté du WebSocket"));

    // 🆕 Notification temps réel
    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: notif.title || "Nouvelle notification",
        text: notif.message || "",
        showConfirmButton: false,
        timer: 3000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 🗑️ Supprimer une notification
  const deleteNotification = async (id) => {
    const ask = await Swal.fire({
      title: "Supprimer cette notification ?",
      text: "Cette action est définitive.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!ask.isConfirmed) return;

    try {
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      Swal.fire("Supprimée ✅", "Notification supprimée avec succès.", "success");
    } catch (err) {
      console.error("Erreur suppression notification :", err);
      Swal.fire("Erreur", "Impossible de supprimer cette notification.", "error");
    }
  };

  // 🧹 Tout supprimer
  const clearAll = async () => {
    const ask = await Swal.fire({
      title: "Effacer toutes les notifications ?",
      text: "Cette action supprimera toutes les notifications.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, tout effacer",
      cancelButtonText: "Annuler",
    });

    if (!ask.isConfirmed) return;

    try {
      await api.delete("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      Swal.fire("Nettoyé 🧹", "Toutes les notifications ont été supprimées.", "success");
    } catch (err) {
      console.error("Erreur suppression notifications :", err);
      Swal.fire("Erreur", "Impossible d’effacer les notifications.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col">
        <main className="p-6 space-y-8">
          {/* 🔹 En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" /> Notifications Admin
            </h2>

            <div className="flex gap-3">
              <button
                onClick={fetchNotifications}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
              <button
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Tout effacer
              </button>
            </div>
          </div>

          {/* 🧱 Liste */}
          {loading ? (
            <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400">
              <Loader2 className="animate-spin w-6 h-6 mr-2 text-primary" />
              Chargement des notifications...
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-20">
              Aucune notification pour le moment 📭
            </p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-5 rounded-lg shadow-md border ${
                    notif.type === "reservation"
                      ? "border-blue-300 bg-blue-50 dark:bg-blue-900/30"
                      : notif.type === "alerte"
                      ? "border-red-300 bg-red-50 dark:bg-red-900/30"
                      : "border-gray-200 bg-white dark:bg-card-dark"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        {notif.icon && (
                          <span
                            className={`text-${
                              notif.type === "alerte" ? "red" : "primary"
                            }-500`}
                          >
                            {notif.icon}
                          </span>
                        )}
                        {notif.title || "Notification"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(notif.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;
