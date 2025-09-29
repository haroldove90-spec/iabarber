import React, { createContext, useState, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
}

// Mock users database
const MOCK_USERS: { [key: string]: { pass: string; role: 'admin' | 'client'; customerId?: number } } = {
    'admin@aibarber.com': { pass: 'password123', role: 'admin' },
    'cliente@email.com': { pass: 'password123', role: 'client', customerId: 2 }, // Corresponds to Jane Smith
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const login = useCallback(async (username: string, pass: string) => {
    const foundUser = MOCK_USERS[username.toLowerCase()];
    if (foundUser && foundUser.pass === pass) {
        setUser({ 
            username, 
            role: foundUser.role,
            customerId: foundUser.customerId
        });
    } else {
        throw new Error("Credenciales inválidas. Por favor, intenta de nuevo.");
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};