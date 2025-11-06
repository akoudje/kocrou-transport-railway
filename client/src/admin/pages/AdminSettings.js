import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Save, UploadCloud, Loader2, CheckCircle2, Building2 } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/settings`;

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    companyName: "",
    logo: "",
    contactEmail: "",
    phone: "",
    address: "",
    workingHours: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Charger les paramètres actuels
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setSettings(res.data || {});
      } catch (err) {
        console.error("Erreur chargement paramètres :", err);
        setError("Impossible de charger les paramètres actuels.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 🔹 Gestion du changement de champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Upload du logo
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings((prev) => ({ ...prev, logo: res.data.url }));
    } catch (err) {
      console.error("Erreur upload logo :", err);
      setError("Échec du téléchargement du logo.");
    }
  };

  // 🔹 Enregistrer les paramètres
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await axios.put(API_URL, settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Erreur sauvegarde paramètres :", err);
      setError("Impossible d’enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin w-8 h-8 mr-2" />
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto bg-white dark:bg-card-dark shadow-xl rounded-xl p-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Paramètres de la compagnie
        </h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Nom de la compagnie
          </label>
          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Ex: Kocrou Transport"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Logo de la compagnie
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-600 dark:text-gray-300"
            />
          </div>
          {settings.logo && (
            <img
              src={settings.logo}
              alt="Logo"
              className="w-16 h-16 rounded-full border object-cover"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Adresse e-mail de contact
          </label>
          <input
            type="email"
            name="contactEmail"
            value={settings.contactEmail}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            placeholder="contact@kocrou.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Numéro de téléphone
          </label>
          <input
            type="text"
            name="phone"
            value={settings.phone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            placeholder="+225 07 00 00 00 00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Adresse postale
          </label>
          <input
            type="text"
            name="address"
            value={settings.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Abidjan, Plateau – Côte d’Ivoire"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Horaires d’ouverture
          </label>
          <input
            type="text"
            name="workingHours"
            value={settings.workingHours}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Lun - Sam : 7h00 - 20h00"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/40 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>Paramètres enregistrés avec succès !</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default AdminSettings;
