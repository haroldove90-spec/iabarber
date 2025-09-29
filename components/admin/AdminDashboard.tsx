import React, { useState, useContext } from 'react';
import { AppointmentsView } from './AppointmentsView';
import { CustomersView } from './CustomersView';
import { GalleryView } from './GalleryView';
import { SalesView } from './SalesView';
import { InventoryView } from './InventoryView'; // Import the new view
import { AuthContext } from '../../context/AuthContext';
import { MenuIcon, CalendarIcon, UsersIcon, ImageIcon, DollarSignIcon, ScissorsIcon, LogoutIcon, BoxIcon } from '../icons';

type AdminView = 'appointments' | 'customers' | 'gallery' | 'sales' | 'inventory';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 text-left p-3 rounded-lg transition-colors w-full ${
            isActive
                ? 'bg-gray-800 text-white font-semibold'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const viewConfig = {
    appointments: { label: 'Citas', icon: <CalendarIcon className="w-5 h-5" /> },
    customers: { label: 'Clientes', icon: <UsersIcon className="w-5 h-5" /> },
    inventory: { label: 'Inventario', icon: <BoxIcon className="w-5 h-5" /> },
    gallery: { label: 'Galería', icon: <ImageIcon className="w-5 h-5" /> },
    sales: { label: 'Ventas', icon: <DollarSignIcon className="w-5 h-5" /> },
};

export const AdminDashboard: React.FC = () => {
    const { logout, user } = useContext(AuthContext);
    const [currentView, setCurrentView] = useState<AdminView>('appointments');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSetView = (view: AdminView) => {
        setCurrentView(view);
        setIsSidebarOpen(false);
    };

    const renderView = () => {
        switch (currentView) {
            case 'appointments': return <AppointmentsView />;
            case 'customers': return <CustomersView />;
            case 'gallery': return <GalleryView />;
            case 'sales': return <SalesView />;
            case 'inventory': return <InventoryView />;
            default: return <AppointmentsView />;
        }
    };
    
    const sidebarContent = (
         <aside className="w-64 bg-gray-950 p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-10">
                <ScissorsIcon className="w-8 h-8 text-gray-200" />
                <h1 className="text-xl font-bold font-playfair tracking-wider text-white">AI BARBER</h1>
            </div>
            <nav className="flex flex-col space-y-2">
                {Object.entries(viewConfig).map(([key, { label, icon }]) => (
                    <NavItem
                        key={key}
                        label={label}
                        icon={icon}
                        isActive={currentView === key}
                        onClick={() => handleSetView(key as AdminView)}
                    />
                ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-800">
                <div className="text-sm mb-4">
                    <p className="text-gray-500">Sesión iniciada como:</p>
                    <p className="font-semibold text-white truncate">{user?.username}</p>
                </div>
                <button 
                    onClick={logout} 
                    className="flex items-center justify-center gap-2 w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <LogoutIcon className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300">
            {/* Mobile Header */}
            <header className="md:hidden bg-gray-950/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    {viewConfig[currentView].icon}
                    <h1 className="text-lg font-bold text-white">{viewConfig[currentView].label}</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2">
                    <MenuIcon className="w-6 h-6 text-white" />
                </button>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden md:block md:flex-shrink-0">
                    {sidebarContent}
                </div>

                {/* Mobile Sidebar (Drawer) */}
                <div 
                    className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                <div className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {sidebarContent}
                </div>

                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};