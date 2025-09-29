import React, { useState, useEffect, useMemo } from 'react';
import { getSalesMetrics } from '../../data/database';
import { DollarSignIcon, ScissorsIcon, UsersIcon } from '../icons';

interface SalesMetrics {
    totalRevenue: number;
    serviceCounts: Record<string, number>;
    barberCounts: Record<string, number>;
}

const MetricCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-gray-950 p-6 rounded-lg shadow-xl flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ title: string, data: Record<string, number> }> = ({ title, data }) => {
    const sortedData = useMemo(() => Object.entries(data).sort(([, a], [, b]) => b - a), [data]);
    const maxValue = useMemo(() => Math.max(...Object.values(data), 1), [data]);

    return (
        <div className="bg-gray-950 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {sortedData.map(([label, value]) => (
                    <div key={label} className="flex items-center gap-4">
                        <p className="text-sm text-gray-400 w-1/3 truncate">{label}</p>
                        <div className="w-2/3 bg-gray-800 rounded-full h-6">
                            <div 
                                className="bg-gray-700 h-6 rounded-full flex items-center justify-end px-2" 
                                style={{ width: `${(value / maxValue) * 100}%` }}
                            >
                                <span className="text-xs font-bold text-white">{value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SalesView: React.FC = () => {
    const [metrics, setMetrics] = useState<SalesMetrics | null>(null);

    useEffect(() => {
        setMetrics(getSalesMetrics());
    }, []);

    if (!metrics) {
        return <p className="text-gray-500">Cargando métricas de ventas...</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold font-playfair text-white mb-6">Análisis de Ventas</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <MetricCard 
                    icon={<DollarSignIcon className="w-6 h-6 text-white"/>} 
                    title="Ingresos Totales" 
                    value={`$${metrics.totalRevenue.toLocaleString()}`}
                    color="bg-green-800/50"
                />
                <MetricCard 
                    icon={<ScissorsIcon className="w-6 h-6 text-white"/>} 
                    title="Servicio Más Popular" 
                    value={Object.keys(metrics.serviceCounts).length > 0 ? Object.entries(metrics.serviceCounts).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'}
                    color="bg-blue-800/50"
                />
                <MetricCard 
                    icon={<UsersIcon className="w-6 h-6 text-white"/>} 
                    title="Barbero Más Solicitado" 
                    value={Object.keys(metrics.barberCounts).length > 0 ? Object.entries(metrics.barberCounts).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'}
                    color="bg-purple-800/50"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Popularidad de Servicios" data={metrics.serviceCounts} />
                <BarChart title="Rendimiento de Barberos (citas)" data={metrics.barberCounts} />
            </div>
        </div>
    );
};