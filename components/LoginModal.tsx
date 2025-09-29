import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Spinner } from './Spinner';
import { EyeIcon, EyeOffIcon } from './icons';

interface LoginModalProps {
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 text-gray-200 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <form onSubmit={handleSubmit} className="p-8">
                    <h2 className="text-2xl font-bold font-playfair text-white mb-6 text-center">Iniciar Sesión</h2>
                    {error && <p className="text-red-400 bg-red-900/50 border border-red-700 text-sm text-center p-2 rounded-md mb-4">{error}</p>}
                    <div className="space-y-4">
                        <input 
                            type="email" 
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
                            required
                        />
                        <div className="relative">
                            <input 
                                type={isPasswordVisible ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border-gray-700 rounded-md p-3 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                                aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div className='mt-2 text-xs text-gray-500'>
                        <p>Admin: admin@aibarber.com / password123</p>
                        <p>Cliente: cliente@email.com / password123</p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-6 w-full bg-gray-200 hover:bg-white text-black font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex justify-center items-center"
                    >
                        {isLoading ? <Spinner size="sm"/> : 'Acceder'}
                    </button>
                </form>
            </div>
        </div>
    );
};