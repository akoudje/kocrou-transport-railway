
import React from "react";
//import { motion } from "framer-motion";
//import { MapPin } from "lucide-react";
import YamoussoukroImg from "../assets/images/Yamoussoukro.jpg";
import BouakeImgImg from "../assets/images/Bouake.jpg";
import KorhogoImg from "../assets/images/Korhogo.jpg";
import SanPedroImg from "../assets/images/San-Pedro.jpg";

const destinations = [
  { name: "Yamoussoukro", image: YamoussoukroImg },
  { name: "Bouaké", image: BouakeImgImg },
  { name: "Korhogo", image: KorhogoImg },
  { name: "San-Pedro", image: SanPedroImg },
];

const Destinations = () => {
  return (
    <section className="py-16 sm:py-24 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Nos destinations favorites
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Laissez-vous inspirer pour votre prochain voyage.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((dest, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl shadow-lg transition-transform hover:-translate-y-1"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="h-80 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
