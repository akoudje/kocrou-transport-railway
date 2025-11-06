import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Crown,
  Lock,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/users`;

const AdminUsers = () => {
  const { user } = useContext(AuthContext); // ✅ compte connecté
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent"); // 🔹 valeur de tri
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Charger tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔍 Filtrage en temps réel
  useEffect(() => {
    let filtered = users.filter((u) => {
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });

    // 🔽 Application du tri
    if (sortOption === "admin") {
      filtered = filtered.sort((a, b) => (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0));
    } else if (sortOption === "name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "recent") {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setFilteredUsers([...filtered]);
  }, [searchTerm, users, sortOption]);

  // 🔹 Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Impossible de supprimer cet utilisateur !");
    }
  };

  // 🔹 Promouvoir en admin
  const handlePromote = async (id) => {
    if (!window.confirm("Rendre cet utilisateur administrateur ?")) return;

    try {
      await axios.put(
        `${API_URL}/${id}/promote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Erreur promotion :", err);
      alert("Impossible de promouvoir cet utilisateur !");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col">
        <main className="p-6">
          {/* 🧭 En-tête avec recherche et tri */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
              Liste des utilisateurs
            </h2>

            <div className="flex flex-wrap gap-3 items-center">
              {/* 🔍 Barre de recherche */}
              <div className="flex items-center gap-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <Search className="text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* 🔽 Sélecteur de tri */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200"
                >
                  <option value="recent">📅 Plus récents</option>
                  <option value="name">🔤 Par nom</option>
                  <option value="admin">👑 Admins d’abord</option>
                </select>
              </div>

              {/* 🔁 Bouton actualiser */}
              <button
                onClick={fetchUsers}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
            </div>
          </div>

          {/* 🧱 Tableau principal */}
          {loading ? (
            <p className="text-gray-500">Chargement des utilisateurs...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Aucun utilisateur trouvé.
            </p>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-card-dark rounded-xl shadow">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 uppercase text-xs">
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Rôle</th>
                    <th className="py-3 px-4 text-center">Date d’inscription</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isCurrentUser = u._id === user?.id;

                    return (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`border-b border-gray-200 dark:border-gray-700 ${
                          isCurrentUser
                            ? "bg-gray-100 dark:bg-gray-800 opacity-75"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          {u.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-500 font-semibold">
                              (Moi)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4 text-center">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                              <ShieldCheck className="w-4 h-4" /> Admin
                            </span>
                          ) : (
                            <span className="text-gray-500">Utilisateur</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center flex justify-center gap-3">
                          {isCurrentUser ? (
                            <span
                              className="text-gray-400 flex items-center gap-1 cursor-not-allowed"
                              title="Impossible de modifier votre propre compte"
                            >
                              <Lock className="w-4 h-4" /> Protégé
                            </span>
                          ) : (
                            <>
                              {!u.isAdmin && (
                                <button
                                  onClick={() => handlePromote(u._id)}
                                  className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                                  title="Rendre administrateur"
                                >
                                  <Crown className="w-4 h-4" /> Promouvoir
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" /> Supprimer
                              </button>
                            </>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;


