import React, { useContext, useState, useMemo } from 'react';
import { BookingContext } from '../context/BookingContext';
import { ToastContext } from '../context/ToastContext';
import { services, barbers, timeSlots } from '../data/barbershopData';

export const BookingModal: React.FC = () => {
    const { 
        isBookingOpen, 
        closeBookingModal, 
        appointmentDetails, 
        updateAppointment,
        addAppointment,
        isTimeSlotTaken 
    } = useContext(BookingContext);
    const { addToast } = useContext(ToastContext);
    const [step, setStep] = useState(1);
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        closeBookingModal();
        setTimeout(() => {
            setStep(1);
            setCustomerDetails({ name: '', email: '', phone: '' });
        }, 300);
    };

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            await addAppointment({ ...appointmentDetails, customer: customerDetails });
            addToast({
                type: 'success',
                title: '¡Cita Confirmada!',
                message: `Gracias, ${customerDetails.name}. Se ha enviado un correo de confirmación.`,
            });
            handleClose();
        } catch (error) {
            console.error("Error al reservar:", error);
            addToast({
                type: 'error',
                title: 'Error en la Reserva',
                message: 'Hubo un error al confirmar tu cita. Por favor, inténtalo de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepComplete = (currentStep: number): boolean => {
        switch(currentStep) {
            case 1:
                return !!appointmentDetails.service && !!appointmentDetails.barber;
            case 2:
                return !!appointmentDetails.date && !!appointmentDetails.time;
            case 3:
                return !!customerDetails.name && !!customerDetails.email && /^\S+@\S+\.\S+$/.test(customerDetails.email);
            default:
                return false;
        }
    };

    const availableTimeSlots = useMemo(() => {
        if (!appointmentDetails.date || !appointmentDetails.barber) return timeSlots;
        return timeSlots.filter(time => !isTimeSlotTaken(appointmentDetails.date!, time, appointmentDetails.barber!));
    }, [appointmentDetails.date, appointmentDetails.barber, isTimeSlotTaken]);
    

    if (!isBookingOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 text-gray-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold font-playfair text-white mb-6 text-center">Reservar tu Cita</h2>

                    {step === 1 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Paso 1: Elige tu Servicio y Barbero</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Servicio</label>
                                    <select 
                                        value={appointmentDetails.service?.name || ''}
                                        onChange={(e) => updateAppointment({ service: services.find(s => s.name === e.target.value) || null })}
                                        className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
                                    >
                                        <option value="" disabled>Selecciona un servicio</option>
                                        {services.map(s => <option key={s.name} value={s.name}>{s.name} - {s.price}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Barbero</label>
                                    <select 
                                        value={appointmentDetails.barber?.name || ''}
                                        onChange={(e) => updateAppointment({ barber: barbers.find(b => b.name === e.target.value) || null })}
                                        className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
                                    >
                                        <option value="" disabled>Selecciona un barbero</option>
                                        {barbers.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} disabled={!isStepComplete(1)} className="mt-6 w-full bg-gray-200 hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400">
                                Siguiente
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                         <div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Paso 2: Elige Fecha y Hora</h3>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
                                    <input 
                                        type="date"
                                        value={appointmentDetails.date ? appointmentDetails.date.toISOString().split('T')[0] : ''}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value);
                                            // Adjust for timezone offset
                                            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                                            updateAppointment({ date: new Date(date.getTime() + userTimezoneOffset), time: null })
                                        }}
                                        className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Hora</label>
                                    {availableTimeSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableTimeSlots.map(time => (
                                                <button 
                                                    key={time}
                                                    onClick={() => updateAppointment({ time })}
                                                    className={`p-2 rounded-md text-sm transition-colors ${appointmentDetails.time === time ? 'bg-gray-200 text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center p-4 bg-gray-800/50 rounded-md">
                                            No hay horarios disponibles para esta fecha. Por favor, selecciona otro día.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button onClick={() => setStep(1)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Atrás
                                </button>
                                <button onClick={() => setStep(3)} disabled={!isStepComplete(2)} className="w-full bg-gray-200 hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400">
                                    Siguiente
                                </button>
                            </div>
                         </div>
                    )}
                    
                    {step === 3 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Paso 3: Tus Datos</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nombre Completo" value={customerDetails.name} onChange={e => setCustomerDetails(d => ({ ...d, name: e.target.value }))} className="w-full bg-gray-800 border-gray-700 rounded-md p-2" />
                                <input type="email" placeholder="Correo Electrónico" value={customerDetails.email} onChange={e => setCustomerDetails(d => ({ ...d, email: e.target.value }))} className="w-full bg-gray-800 border-gray-700 rounded-md p-2" />
                                <input type="tel" placeholder="Teléfono" value={customerDetails.phone} onChange={e => setCustomerDetails(d => ({ ...d, phone: e.target.value }))} className="w-full bg-gray-800 border-gray-700 rounded-md p-2" />
                            </div>
                            <div className="mt-4 p-4 bg-black/50 rounded-md border border-gray-800 text-sm">
                                <h4 className="font-bold text-white mb-2">Resumen de la Cita</h4>
                                <p><strong>Servicio:</strong> {appointmentDetails.service?.name}</p>
                                <p><strong>Barbero:</strong> {appointmentDetails.barber?.name}</p>
                                <p><strong>Fecha:</strong> {appointmentDetails.date?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {appointmentDetails.time}</p>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button onClick={() => setStep(2)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Atrás
                                </button>
                                <button onClick={handleConfirmBooking} disabled={!isStepComplete(3) || isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400">
                                    {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};