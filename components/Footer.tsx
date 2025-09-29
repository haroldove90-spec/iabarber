import React from 'react';
import { ScissorsIcon } from './icons';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gray-950 text-gray-500 py-12">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <ScissorsIcon className="w-8 h-8 text-gray-200" />
          <span className="text-xl font-bold font-playfair tracking-wider text-white">AI BARBER</span>
        </div>
        <p>Calle del Estilo 123, Oficina 101, Metrópolis, ESP</p>
        <p>(555) 123-4567 | contacto@aibarber.com</p>
        <div className="flex justify-center space-x-6 mt-6">
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
        <p className="mt-8 text-sm text-gray-600">&copy; {new Date().getFullYear()} AI Barber. Todos los Derechos Reservados.</p>
      </div>
    </footer>
  );
};