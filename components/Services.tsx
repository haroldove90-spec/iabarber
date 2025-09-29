import React, { useContext } from 'react';
import { BookingContext } from '../context/BookingContext';
import { services } from '../data/barbershopData';

export const Services: React.FC = () => {
  const { openBookingModal } = useContext(BookingContext);

  return (
    <section id="services" className="py-20 bg-gray-950/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair text-white">Nuestros Servicios</h2>
          <div className="w-24 h-1 bg-gray-300 mx-auto mt-4"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-800 py-6 gap-4">
              <div className='flex-grow'>
                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                <p className="text-gray-400">{service.description}</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6">
                <p className="text-xl font-bold text-gray-200 whitespace-nowrap">{service.price}</p>
                <button 
                  onClick={() => openBookingModal({ service })}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap">
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};