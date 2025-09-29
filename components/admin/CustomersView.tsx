import React, { useState, useEffect, useContext } from 'react';
import { getCustomers } from '../../data/database';
import type { Customer } from '../../types';
import { ToastContext } from '../../context/ToastContext';

export const CustomersView: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const { addToast } = useContext(ToastContext);

    useEffect(() => {
        setCustomers(getCustomers());
    }, []);

    const handleSendReminder = (customer: Customer) => {
        console.log("--- SIMULACIÓN DE CORREO DE RECORDATORIO ---");
        console.log(`Para: ${customer.email}`);
        console.log(`Asunto: Recordatorio de tu próxima cita en AI Barber`);
        console.log(`Hola ${customer.name},`);
        console.log(`Solo un recordatorio amistoso sobre tu próxima cita con nosotros. ¡Esperamos verte pronto!`);
        console.log("-----------------------------------------");
        addToast({
            type: 'info',
            title: 'Recordatorio Enviado',
            message: `Se ha enviado un correo de recordatorio a ${customer.name}.`,
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-playfair text-white mb-6">Clientes Registrados</h1>
            
            {customers.length === 0 ? (
                <p className="text-gray-500">No hay clientes registrados.</p>
            ) : (
                <div className="bg-gray-950 rounded-lg shadow-xl overflow-hidden">
                    <ul className="divide-y divide-gray-800">
                        {customers.map((customer) => (
                            <li key={customer.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <p className="text-lg font-semibold text-white">{customer.name}</p>
                                    <p className="text-sm text-gray-400">{customer.email}</p>
                                    <p className="text-sm text-gray-500">{customer.phone}</p>
                                </div>
                                <button 
                                    onClick={() => handleSendReminder(customer)}
                                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm self-start sm:self-center"
                                >
                                    Enviar Recordatorio
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};