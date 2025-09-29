import React, { useState, useEffect, useContext } from 'react';
import { getPublicGalleryImages } from '../data/database';
import { barbers } from '../data/barbershopData';
import type { GalleryImage } from '../types';
import { BookingContext } from '../context/BookingContext';

export const GallerySection: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const { openBookingModal } = useContext(BookingContext);

    useEffect(() => {
        setImages(getPublicGalleryImages());
    }, []);

    const handleBookLook = (barberName: string) => {
        const barber = barbers.find(b => b.name === barberName);
        if (barber) {
            openBookingModal({ barber });
        } else {
            // Fallback if barber not found, open modal without pre-selection
            openBookingModal({});
        }
    };

    if (images.length === 0) return null;

    return (
        <section id="gallery" className="py-20 bg-gray-950/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-playfair text-white">Nuestra Galería de Estilos</h2>
                    <p className="text-gray-400 mt-2">Inspiración de nuestros talentosos barberos.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg shadow-lg">
                            <img 
                                src={image.src} 
                                alt={image.alt} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300 opacity-0 group-hover:opacity-100">
                                <div className="transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                                    <p className="text-white font-semibold text-sm">{image.alt}</p>
                                    <p className="text-gray-300 text-xs mb-2">por {image.barberName}</p>
                                    <button
                                        onClick={() => handleBookLook(image.barberName)}
                                        className="text-xs bg-gray-200 text-black font-bold px-3 py-1 rounded-md hover:bg-white transition-colors"
                                    >
                                        Reservar este Look
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};