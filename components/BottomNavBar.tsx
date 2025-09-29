import React from 'react';
import { HomeIcon, ScissorsIcon, UserGroupIcon, PhoneIcon } from './icons';

export const BottomNavBar: React.FC = () => {
    const navItems = [
        { href: '#', icon: <HomeIcon className="w-6 h-6" />, label: 'Inicio' },
        { href: '#recommender', icon: <ScissorsIcon className="w-6 h-6" />, label: 'Estilos' },
        { href: '#barbers', icon: <UserGroupIcon className="w-6 h-6" />, label: 'Barberos' },
        { href: '#contact', icon: <PhoneIcon className="w-6 h-6" />, label: 'Contacto' },
    ];

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const targetId = href.substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-40">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <a 
                        key={item.label}
                        href={item.href} 
                        onClick={(e) => handleScroll(e, item.href)}
                        className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors flex-1"
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};
