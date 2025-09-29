import React, { useContext } from 'react';
import { BookingContext } from '../context/BookingContext';
import { barbers } from '../data/barbershopData';

export const Barbers: React.FC = () => {
  const { openBookingModal } = useContext(BookingContext);

  return (
    <section id="barbers" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair text-white">Conoce a Nuestros Maestros Barberos</h2>
          <p className="text-gray-400 mt-2">Los artistas detrás del sillón.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {barbers.map((barber, index) => (
            <div key={index} className="group text-center flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full overflow-hidden mx-auto shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <img src={barber.img} alt={barber.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-xl font-bold mt-4 text-white">{barber.name}</h3>
              <p className="text-gray-300 flex-grow">{barber.specialty}</p>
              <button
                onClick={() => openBookingModal({ barber })} 
                className="mt-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};