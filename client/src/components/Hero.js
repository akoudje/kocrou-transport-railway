import React, { useState } from "react";
import { MapPin, Calendar, Users, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
//import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    depart: "",
    arrivee: "",
    date: "",
    passagers: "1",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Redirection avec paramètres GET
    const query = new URLSearchParams(form).toString();
    navigate(`/recherche?${query}`);
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[560px] items-center justify-center py-16 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(13, 18, 27, 0.5), rgba(13, 18, 27, 0.8)), url('https://images.unsplash.com/photo-1509587584298-0f3b3de5a2d2?auto=format&fit=crop&w=1600&q=80')",
        }}
      ></div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4">
        <h1 className="text-4xl md:text-6xl font-black text-white">
          Voyagez simplement, réservez maintenant
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-200 md:text-lg">
          Trouvez les meilleurs trajets en bus pour votre prochaine aventure.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-xl bg-background-light dark:bg-card-dark p-4 sm:p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium">Départ</p>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="depart"
                  placeholder="Ville de départ"
                  value={form.depart}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium">Destination</p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="arrivee"
                  placeholder="Ville d'arrivée"
                  value={form.arrivee}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium">Date de départ</p>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium">Passagers</p>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="passagers"
                  min="1"
                  value={form.passagers}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            <button
              type="submit"
              className="h-14 px-5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;




