// src/client/admin/pages/AdminSettings.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, Image, Loader2, CheckCircle2, Upload } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/api";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    compagnieName: "Kocrou Transport",
    logo: "",
    couleurPrincipale: "#2563eb",
    tarifParKm: 100,
    nombrePlacesDefaut: 50,
  });
  const [previewLogo, setPreviewLogo] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Charger les paramètres existants
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data) {
        setSettings({
          compagnieName: data.compagnieName || "Kocrou Transport",
          logo: data.logo || "",
          couleurPrincipale: data.couleurPrincipale || "#2563eb",
          tarifParKm: data.tarifParKm || 100,
          nombrePlacesDefaut: data.nombrePlacesDefaut || 50,
        });
        setPreviewLogo(data.logo || "");
      }
    } catch (err) {
      console.error("Erreur chargement paramètres :", err);
      Swal.fire("Erreur", "Impossible de charger les paramètres système.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ Gestion des champs texte / nombre / couleur
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Upload du logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setLoading(true);
      const { data } = await api.post("/settings/upload-logo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSettings((prev) => ({ ...prev, logo: data.url }));
      setPreviewLogo(data.url);
      Swal.fire("✅ Logo mis à jour", "Le logo a été téléchargé avec succès.", "success");
    } catch (err) {
      console.error("Erreur upload logo :", err);
      Swal.fire("Erreur", "Échec du téléchargement du logo.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sauvegarde des paramètres
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.put("/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Paramètres sauvegardés ✅",
        text: "Les paramètres système ont été mis à jour avec succès.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erreur sauvegarde paramètres :", err);
      Swal.fire("Erreur", "Impossible d’enregistrer les paramètres.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col">
        <main className="p-6 space-y-8">
          {/* Titre */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
              ⚙️ Paramètres Système
            </h2>
            <button
              onClick={fetchSettings}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
          </div>

          {/* Formulaire principal */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card-dark p-6 rounded-xl shadow space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom de la compagnie */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom de la compagnie
                </label>
                <input
                  type="text"
                  name="compagnieName"
                  value={settings.compagnieName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Kocrou Transport"
                />
              </div>

              {/* Tarif par km */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tarif par km (FCFA)
                </label>
                <input
                  type="number"
                  name="tarifParKm"
                  value={settings.tarifParKm}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Nombre de places */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre de places par défaut
                </label>
                <input
                  type="number"
                  name="nombrePlacesDefaut"
                  value={settings.nombrePlacesDefaut}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Couleur principale */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="couleurPrincipale"
                    value={settings.couleurPrincipale}
                    onChange={handleChange}
                    className="w-12 h-10 border rounded"
                  />
                  <span className="text-sm text-gray-500">{settings.couleurPrincipale}</span>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <label className="block text-sm font-medium mb-2">
                Logo de la compagnie
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {previewLogo ? (
                  <img
                    src={previewLogo}
                    alt="Logo"
                    className="w-20 h-20 object-contain border rounded-lg shadow"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <Image className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
                  <Upload className="w-4 h-4" /> Importer un logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>

            {/* Bouton Sauvegarde */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Sauvegarder
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* ✅ Indicateur de succès */}
          <div className="flex justify-center text-green-600 dark:text-green-400 text-sm mt-4">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
