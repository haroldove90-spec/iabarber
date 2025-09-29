import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookingContext } from '../context/BookingContext';
import * as db from '../data/database';
import type { Appointment } from '../types';

interface ProfileModalProps {
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const { openBookingModal } = useContext(BookingContext);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    useEffect(() => {
        if (user?.customerId) {
            setAppointments(db.getAppointmentsForCustomer(user.customerId));
        }
    }, [user]);

    const handleRebook = (appointment: Appointment) => {
        openBookingModal({ service: appointment.service, barber: appointment.barber });
        onClose();
    };
    
    const now = new Date();
    const upcomingAppointments = appointments.filter(app => app.date >= now);
    const pastAppointments = appointments.filter(app => app.date < now);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 text-gray-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold font-playfair text-white mb-2 text-center">Mi Perfil</h2>
                    <p className="text-center text-gray-400 mb-6 text-sm">Bienvenido de nuevo, {user?.username.split('@')[0]}</p>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">Próximas Citas</h3>
                            {upcomingAppointments.length > 0 ? (
                                <ul className="space-y-3">
                                    {upcomingAppointments.map(app => (
                                        <li key={app.id} className="bg-gray-800/50 p-3 rounded-md">
                                            <p className="font-bold">{app.service.name}</p>
                                            <p className="text-sm text-gray-400">con {app.barber.name}</p>
                                            <p className="text-sm text-gray-400">{app.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {app.time}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">No tienes próximas citas.</p>}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">Historial de Citas</h3>
                            {pastAppointments.length > 0 ? (
                                <ul className="space-y-3">
                                    {pastAppointments.map(app => (
                                        <li key={app.id} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">{app.service.name}</p>
                                                <p className="text-sm text-gray-400">con {app.barber.name}</p>
                                                <p className="text-sm text-gray-500">{app.date.toLocaleDateString('es-ES')}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleRebook(app)}
                                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors"
                                            >
                                                Volver a Reservar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">Aún no tienes un historial de citas.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
