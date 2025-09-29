import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { ScissorsIcon, UserCircleIcon, LogoutIcon } from './icons';

interface HeaderProps {
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const navLinks = [
    { name: 'Cómo Funciona', href: '#recommender' },
    { name: 'Servicios', href: '#services' },
    { name: 'Barberos', href: '#barbers' },
    { name: 'Galería', href: '#gallery' },
    { name: 'Contacto', href: '#contact' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2">
            <ScissorsIcon className="w-8 h-8 text-gray-200" />
            <span className="text-xl font-bold font-playfair tracking-wider text-white">AI BARBER</span>
          </a>
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={(e) => handleScroll(e, link.href)} className="text-gray-300 hover:text-white transition-colors">{link.name}</a>
            ))}
          </nav>
          <div>
            {user ? (
              <div className="flex items-center gap-2">
                 {user.role === 'client' && (
                    <button onClick={onProfileClick} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </button>
                 )}
                 <button onClick={logout} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors" aria-label="Cerrar sesión">
                    <LogoutIcon className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <UserCircleIcon className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
    </>
  );
};