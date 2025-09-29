import React, { useState, useEffect, useMemo } from 'react';
import { getAppointments } from '../../data/database';
import type { Appointment, Customer } from '../../types';

type EnrichedAppointment = Appointment & { customer?: Customer };
type ViewMode = 'list' | 'calendar';

const CalendarView: React.FC<{ appointments: EnrichedAppointment[], month: Date }> = ({ appointments, month }) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

    const calendarDays = useMemo(() => {
        const days = [];
        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ key: `empty-${i}`, date: null, appointments: [] });
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(month.getFullYear(), month.getMonth(), i);
            const dailyAppointments = appointments.filter(app => 
                app.date.getFullYear() === currentDate.getFullYear() &&
                app.date.getMonth() === currentDate.getMonth() &&
                app.date.getDate() === currentDate.getDate()
            );
            days.push({ key: `day-${i}`, date: i, appointments: dailyAppointments });
        }
        return days;
    }, [month, appointments]);
    
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="bg-gray-950 rounded-lg shadow-xl p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 font-bold mb-2">
                {weekdays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => (
                    <div key={day.key} className={`h-24 sm:h-32 rounded bg-gray-900/50 p-1.5 overflow-hidden ${day.date ? '' : 'opacity-50'}`}>
                        <div className="text-xs font-bold text-gray-300">{day.date}</div>
                        <div className="text-xs space-y-1 mt-1 overflow-y-auto max-h-[80%]">
                            {day.appointments.map(app => (
                                <div key={app.id} className="bg-gray-800 p-1 rounded-sm leading-tight">
                                    <p className="font-semibold text-gray-200 truncate">{app.time} - {app.customer?.name}</p>
                                    <p className="text-gray-400 truncate">{app.barber.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AppointmentsView: React.FC = () => {
    const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    useEffect(() => {
        setAppointments(getAppointments());
    }, []);

    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatWeekday = (date: Date) => date.toLocaleDateString('es-ES', { weekday: 'long' });

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold font-playfair text-white">Próximas Citas</h1>
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                    <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Lista</button>
                    <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'calendar' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Calendario</button>
                </div>
            </div>

            {viewMode === 'calendar' && (
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-800 rounded">&lt;</button>
                    <h2 className="text-xl font-bold text-white capitalize">{currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-800 rounded">&gt;</button>
                </div>
            )}
            
            {appointments.length === 0 ? (
                <p className="text-gray-500">No hay citas programadas.</p>
            ) : (
                viewMode === 'list' ? (
                    <>
                        {/* Mobile View - Cards */}
                        <div className="md:hidden space-y-4">
                            {appointments.map((app) => (
                                <div key={app.id} className="bg-gray-950 rounded-lg shadow-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-lg font-bold text-white">{app.customer?.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-400">{app.customer?.email || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-200">{app.time}</p>
                                            <p className="text-sm text-gray-500">{formatDate(app.date)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <p className="font-semibold text-gray-300">{app.service.name}</p>
                                        <p className="text-sm text-gray-400">con {app.barber.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden md:block bg-gray-950 rounded-lg shadow-xl overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className="p-4 font-semibold">Cliente</th>
                                        <th className="p-4 font-semibold">Fecha</th>
                                        <th className="p-4 font-semibold">Hora</th>
                                        <th className="p-4 font-semibold">Servicio</th>
                                        <th className="p-4 font-semibold">Barbero</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {appointments.map((app) => (
                                        <tr key={app.id}>
                                            <td className="p-4">
                                                <p className="font-semibold text-white">{app.customer?.name || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{app.customer?.email || 'N/A'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-200">{formatDate(app.date)}</p>
                                                <p className="text-sm text-gray-500 capitalize">{formatWeekday(app.date)}</p>
                                            </td>
                                            <td className="p-4 font-bold text-white">{app.time}</td>
                                            <td className="p-4 text-gray-300">{app.service.name}</td>
                                            <td className="p-4 text-gray-300">{app.barber.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <CalendarView appointments={appointments} month={currentMonth} />
                )
            )}
        </div>
    );
};