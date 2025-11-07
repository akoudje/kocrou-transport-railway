import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card-light dark:bg-card-dark border-t border-subtle-light dark:border-subtle-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">Kocrou Transport</h4>
            <ul className="space-y-2">
             <li><button onClick={() => alert("À venir")}>À propos</button></li>
              <li><button onClick={() => alert("À venir")}>Contact</button></li>
              <li><button onClick={() => alert("À venir")}>Presse</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
               <li><button onClick={() => alert("À venir")}>FAQ</button></li>
              <li><button onClick={() => alert("À venir")}>Centre d'aide</button></li>
              <li><button onClick={() => alert("À venir")}>Conditions Générales</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><button onClick={() => alert("À venir")}>Confidentialité</button></li>
              <li><button onClick={() => alert("À venir")}>Mentions légales</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4 text-gray-500">
              <Twitter className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Facebook className="w-5 h-5 hover:text-primary cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-subtle-light dark:border-subtle-dark pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Kocrou Transport. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

