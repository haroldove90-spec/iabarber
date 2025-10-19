import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Spinner } from './Spinner';
import { EyeIcon, EyeOffIcon } from './icons';

interface LoginModalProps {
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { login, register } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    
    const [view, setView] = useState<'login' | 'register'>('login');
    
    // Login state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(loginUsername, loginPassword);
            addToast({ type: 'success', title: '¡Bienvenido!', message: `Has iniciado sesión correctamente.` });
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await register({
                name: regName,
                email: regEmail,
                phone: regPhone,
                password: regPassword,
            });
            addToast({ type: 'success', title: '¡Registro Exitoso!', message: `Bienvenido, ${regName}. Tu cuenta ha sido creada.` });
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error en el registro.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearFormState = () => {
        setLoginUsername('');
        setLoginPassword('');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setError(null);
        setIsPasswordVisible(false);
    };

    const switchView = (newView: 'login' | 'register') => {
        clearFormState();
        setView(newView);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 text-gray-200 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {view === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="p-8">
                        <h2 className="text-2xl font-bold font-playfair text-white mb-6 text-center">Iniciar Sesión</h2>
                        {error && <p className="text-red-400 bg-red-900/50 border border-red-700 text-sm text-center p-2 rounded-md mb-4">{error}</p>}
                        <div className="space-y-4">
                            <input 
                                type="text"
                                placeholder="Usuario o Email"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
                                required
                            />
                            <div className="relative">
                                <input 
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
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
                            <p>Usuario Admin: admin / admin123</p>
                            <p>Usuario Cliente: cliente / cliente123</p>
                        </div>
                        <button type="submit" disabled={isLoading} className="mt-6 w-full bg-gray-200 hover:bg-white text-black font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex justify-center items-center">
                            {isLoading ? <Spinner size="sm"/> : 'Acceder'}
                        </button>
                        <p className="text-center text-sm text-gray-400 mt-4">
                            ¿No tienes cuenta? <button type="button" onClick={() => switchView('register')} className="font-semibold text-gray-200 hover:underline">Regístrate</button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="p-8">
                        <h2 className="text-2xl font-bold font-playfair text-white mb-6 text-center">Crear Cuenta</h2>
                        {error && <p className="text-red-400 bg-red-900/50 border border-red-700 text-sm text-center p-2 rounded-md mb-4">{error}</p>}
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre Completo" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-md p-3" required />
                            <input type="email" placeholder="Correo Electrónico" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-md p-3" required />
                            <input type="tel" placeholder="Teléfono (Opcional)" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-md p-3" />
                            <div className="relative">
                                <input 
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    placeholder="Contraseña (mín. 6 caracteres)"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    className="w-full bg-gray-800 border-gray-700 rounded-md p-3 pr-10"
                                    required
                                />
                                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200">
                                    {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="mt-6 w-full bg-gray-200 hover:bg-white text-black font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex justify-center items-center">
                            {isLoading ? <Spinner size="sm"/> : 'Crear Cuenta'}
                        </button>
                        <p className="text-center text-sm text-gray-400 mt-4">
                            ¿Ya tienes cuenta? <button type="button" onClick={() => switchView('login')} className="font-semibold text-gray-200 hover:underline">Inicia Sesión</button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};