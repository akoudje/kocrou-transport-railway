// src/client/admin/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Bus, DollarSign, Calendar } from "lucide-react";
import api from "../../utils/api"; // ✅ centralisé

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    trajets: 0,
    reservations: 0,
    revenue: 0,
  });
  const [reservationsByMonth, setReservationsByMonth] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Chargement des données globales
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, trajetsRes, reservationsRes] = await Promise.all([
        api.get("/users", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/trajets", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/reservations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const users = usersRes.data.length;
      const trajets = trajetsRes.data.length;
      const reservations = reservationsRes.data.length;

      const revenue = reservationsRes.data.reduce(
        (sum, r) => sum + (r.trajet?.prix || r.segment?.prix || 0),
        0
      );

      // ✅ Réservations par mois
      const monthly = {};
      reservationsRes.data.forEach((r) => {
        const month = new Date(r.dateReservation).toLocaleString("fr-FR", {
          month: "short",
        });
        monthly[month] = (monthly[month] || 0) + 1;
      });

      // ✅ Top destinations
      const destinations = {};
      reservationsRes.data.forEach((r) => {
        const dest = r.trajet?.villeArrivee || r.segment?.arrivee || "Inconnue";
        destinations[dest] = (destinations[dest] || 0) + 1;
      });

      setStats({ users, trajets, reservations, revenue });
      setReservationsByMonth(
        Object.entries(monthly).map(([mois, total]) => ({ mois, total }))
      );
      setTopDestinations(
        Object.entries(destinations)
          .map(([ville, total]) => ({ ville, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Erreur dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-300">
        Chargement des statistiques...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col">
        <main className="p-6 space-y-10">
          {/* 🔹 Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Utilisateurs</p>
                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                  {stats.users}
                </h2>
              </div>
              <Users className="text-primary w-8 h-8" />
            </div>

            <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Trajets</p>
                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                  {stats.trajets}
                </h2>
              </div>
              <Bus className="text-green-500 w-8 h-8" />
            </div>

            <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Réservations</p>
                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                  {stats.reservations}
                </h2>
              </div>
              <Calendar className="text-yellow-500 w-8 h-8" />
            </div>

            <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenus</p>
                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                  {stats.revenue.toLocaleString()} FCFA
                </h2>
              </div>
              <DollarSign className="text-emerald-600 w-8 h-8" />
            </div>
          </div>

          {/* 📈 Graphique : Réservations par mois */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">
              Réservations par mois
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reservationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 🥇 Graphique : Top 5 destinations */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">
              Top 5 destinations
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topDestinations}
                  dataKey="total"
                  nameKey="ville"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {topDestinations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
