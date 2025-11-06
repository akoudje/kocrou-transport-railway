import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { FileDown, CalendarDays, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/admin/reservations`;

const AdminReports = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const token = localStorage.getItem("token");

  // 🔹 Charger toutes les réservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("Erreur récupération réservations :", err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // 🔹 Filtrage par période
  const handleFilter = () => {
    if (!startDate || !endDate) {
      setFilteredData(reservations);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = reservations.filter((res) => {
      const date = new Date(res.date);
      return date >= start && date <= end;
    });

    setFilteredData(filtered);
  };

  // 🔹 Calculs des revenus et volume
  const stats = filteredData.reduce(
    (acc, r) => {
      acc.total += r.trajet?.prix || 0;
      acc.count += 1;
      return acc;
    },
    { total: 0, count: 0 }
  );

  // 🔹 Préparation des données pour Recharts
  const revenueByDate = filteredData.reduce((acc, r) => {
    const d = new Date(r.date).toLocaleDateString("fr-FR");
    const existing = acc.find((x) => x.date === d);
    if (existing) existing.total += r.trajet?.prix || 0;
    else acc.push({ date: d, total: r.trajet?.prix || 0 });
    return acc;
  }, []);

  // 🔹 Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((r) => ({
        Client: r.user?.name || "Inconnu",
        Compagnie: r.trajet?.compagnie,
        Départ: r.trajet?.villeDepart,
        Arrivée: r.trajet?.villeArrivee,
        Prix: r.trajet?.prix,
        Siège: r.seat,
        Date: new Date(r.date).toLocaleString(),
        Statut: r.statut,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Réservations");
    XLSX.writeFile(workbook, "rapport_reservations.xlsx");
  };

  // 🔹 Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Rapport des réservations", 14, 15);
    doc.autoTable({
      head: [["Client", "Trajet", "Prix (FCFA)", "Date", "Statut"]],
      body: filteredData.map((r) => [
        r.user?.name || "Inconnu",
        `${r.trajet?.villeDepart} → ${r.trajet?.villeArrivee}`,
        r.trajet?.prix?.toLocaleString(),
        new Date(r.date).toLocaleDateString("fr-FR"),
        r.statut,
      ]),
      startY: 25,
    });
    doc.save("rapport_reservations.pdf");
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-background-dark">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
          📊 Rapports et statistiques
        </h2>
        <button
          onClick={fetchReservations}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* 🔹 Filtres */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200"
          />
        </div>
        <span>→</span>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200"
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Filtrer
        </button>
      </div>

      {/* 🔹 Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card-dark p-6 rounded-xl shadow"
        >
          <h3 className="text-gray-500 text-sm mb-2">Revenus totaux</h3>
          <p className="text-3xl font-bold text-primary">
            {stats.total.toLocaleString()} FCFA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card-dark p-6 rounded-xl shadow"
        >
          <h3 className="text-gray-500 text-sm mb-2">Nombre de réservations</h3>
          <p className="text-3xl font-bold text-primary">{stats.count}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card-dark p-6 rounded-xl shadow"
        >
          <h3 className="text-gray-500 text-sm mb-2">Période sélectionnée</h3>
          <p className="text-md font-semibold text-gray-700 dark:text-gray-300">
            {startDate && endDate
              ? `${new Date(startDate).toLocaleDateString()} → ${new Date(
                  endDate
                ).toLocaleDateString()}`
              : "Toutes les dates"}
          </p>
        </motion.div>
      </div>

      {/* 📊 Graphique : Revenus par date */}
      <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow mb-10">
        <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">
          Revenus par jour
        </h3>
        {revenueByDate.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Aucune donnée à afficher pour cette période.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 📊 Graphique : Volume de réservations */}
      <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow mb-10">
        <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">
          Nombre de réservations par jour
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📁 Export */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={exportPDF}
          className="bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 flex items-center gap-2 transition"
        >
          <FileDown className="w-5 h-5" /> Exporter en PDF
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
        >
          <FileDown className="w-5 h-5" /> Exporter en Excel
        </button>
      </div>
    </div>
  );
};

export default AdminReports;
