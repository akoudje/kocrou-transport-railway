import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/api";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  // 🔹 Charger les logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/reports/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(data.reverse());
    } catch (err) {
      console.error("Erreur chargement logs :", err);
      Swal.fire("Erreur", "Impossible de charger les journaux d’activité.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🧹 Nettoyer tous les logs
  const clearLogs = async () => {
    const ask = await Swal.fire({
      title: "Effacer tous les journaux ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer tout",
      cancelButtonText: "Annuler",
    });
    if (!ask.isConfirmed) return;

    try {
      await api.delete("/reports/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs([]);
      Swal.fire("Nettoyé 🧹", "Tous les journaux ont été supprimés.", "success");
    } catch (err) {
      console.error("Erreur suppression logs :", err);
      Swal.fire("Erreur", "Impossible d’effacer les logs.", "error");
    }
  };

  // 🔍 Filtrage des logs
  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* 🔹 En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Journaux d’activité
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">Tous les types</option>
              <option value="info">Info</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="security">Sécurité</option>
            </select>

            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>

            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" /> Tout effacer
            </button>
          </div>
        </div>

        {/* 🧱 Contenu */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-primary" />
            Chargement des journaux...
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20">
            Aucun journal disponible 🕊️
          </p>
        ) : (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Utilisateur</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log, i) => (
                  <motion.tr
                    key={log._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {new Date(log.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        log.type === "error"
                          ? "text-red-500"
                          : log.type === "warning"
                          ? "text-yellow-500"
                          : log.type === "security"
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    >
                      {log.type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {log.user?.name || "Système"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {log.details || "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogs;
