import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Shield, Trash2, Edit3, UserCheck, Loader2 } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/logs`;

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { params: { type: filter } });
      setLogs(res.data);
    } catch (err) {
      console.error("Erreur chargement logs :", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "login":
        return <UserCheck className="text-blue-500 w-5 h-5" />;
      case "trajet_update":
        return <Edit3 className="text-green-500 w-5 h-5" />;
      case "trajet_delete":
        return <Trash2 className="text-red-500 w-5 h-5" />;
      case "reservation_cancel":
        return <Trash2 className="text-orange-500 w-5 h-5" />;
      default:
        return <Shield className="text-gray-400 w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto p-6 bg-white dark:bg-card-dark rounded-xl shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
          🔍 Journal d’audit (AdminLogs)
        </h2>
        <select
          className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Toutes les actions</option>
          <option value="login">Connexions</option>
          <option value="trajet_update">Mises à jour trajets</option>
          <option value="trajet_delete">Suppressions trajets</option>
          <option value="reservation_cancel">Annulations réservations</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          Chargement des logs...
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Aucun événement enregistré.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Utilisateur</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 flex items-center gap-2">
                    {getIcon(log.type)}
                    <span>{log.type}</span>
                  </td>
                  <td className="p-3">{log.user?.name || "—"}</td>
                  <td className="p-3">{log.description}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminLogs;
