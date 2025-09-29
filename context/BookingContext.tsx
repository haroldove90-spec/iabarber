import React, { createContext, useState, useCallback } from 'react';
import type { AppointmentDetails, Service, Barber, Appointment, Customer } from '../types';
import * as db from '../data/database';

interface BookingContextType {
  isBookingOpen: boolean;
  appointmentDetails: AppointmentDetails;
  openBookingModal: (initialDetails: { service?: Service; barber?: Barber }) => void;
  closeBookingModal: () => void;
  updateAppointment: (details: Partial<AppointmentDetails>) => void;
  addAppointment: (details: AppointmentDetails) => Promise<void>;
  isTimeSlotTaken: (date: Date, time: string, barber: Barber) => boolean;
}

export const BookingContext = createContext<BookingContextType>({
  isBookingOpen: false,
  appointmentDetails: { service: null, barber: null, date: null, time: null },
  openBookingModal: () => {},
  closeBookingModal: () => {},
  updateAppointment: () => {},
  addAppointment: async () => {},
  isTimeSlotTaken: () => false,
});

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails>({
    service: null,
    barber: null,
    date: null,
    time: null,
  });

  const openBookingModal = useCallback((initialDetails: { service?: Service; barber?: Barber }) => {
    setAppointmentDetails(prev => ({
        ...prev,
        service: initialDetails.service || null,
        barber: initialDetails.barber || null,
        date: null,
        time: null,
    }));
    setIsBookingOpen(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsBookingOpen(false);
    setTimeout(() => {
        setAppointmentDetails({ service: null, barber: null, date: null, time: null });
    }, 300);
  }, []);

  const updateAppointment = useCallback((details: Partial<AppointmentDetails>) => {
    setAppointmentDetails(prev => ({ ...prev, ...details }));
  }, []);

  const addAppointment = useCallback(async (details: AppointmentDetails) => {
    if (!details.service || !details.barber || !details.date || !details.time || !details.customer) {
        throw new Error("Faltan detalles para confirmar la cita.");
    }

    const customer = await db.addOrUpdateCustomer(details.customer);

    const newAppointment: Omit<Appointment, 'id'> = {
        service: details.service,
        barber: details.barber,
        date: details.date,
        time: details.time,
        customerId: customer.id,
    };
    await db.addAppointment(newAppointment);

    // Simular envío de correo
    console.log("--- SIMULACIÓN DE CORREO ---");
    console.log(`Para: ${customer.email}`);
    console.log(`Asunto: Confirmación de tu cita en AI Barber`);
    console.log(`Hola ${customer.name},`);
    console.log(`Tu cita está confirmada para el ${details.date.toLocaleDateString()} a las ${details.time} con ${details.barber.name}.`);
    console.log("--------------------------");

  }, []);
  
  const isTimeSlotTaken = useCallback((date: Date, time: string, barber: Barber) => {
    return db.isTimeSlotTaken(date, time, barber.name);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        isBookingOpen,
        appointmentDetails,
        openBookingModal,
        closeBookingModal,
        updateAppointment,
        addAppointment,
        isTimeSlotTaken,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};