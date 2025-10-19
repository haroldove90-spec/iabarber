import React, { createContext, useState, useCallback } from 'react';
import type { User, Customer } from '../types';
import * as db from '../data/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<void>;
  register: (customerData: Omit<Customer, 'id'>) => Promise<void>;
  logout: () => void;
}

// Mock users database for special roles
const MOCK_USERS: { [key: string]: { pass: string; role: 'admin' | 'client'; customerId?: number } } = {
    'admin': { pass: 'admin123', role: 'admin' },
    'cliente': { pass: 'cliente123', role: 'client', customerId: 2 },
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const login = useCallback(async (username: string, pass: string) => {
    const lowerUsername = username.toLowerCase();
    
    // 1. Check mock users (admin, demo client)
    const mockUser = MOCK_USERS[lowerUsername];
    if (mockUser && mockUser.pass === pass) {
        setUser({ 
            username, 
            role: mockUser.role,
            customerId: mockUser.customerId
        });
        return;
    }

    // 2. Check DB for registered clients by email
    const dbCustomer = db.findCustomerByEmail(lowerUsername);
    if (dbCustomer && dbCustomer.password === pass) {
        setUser({
            username: dbCustomer.name,
            role: 'client',
            customerId: dbCustomer.id,
        });
        return;
    }

    throw new Error("Credenciales inválidas. Por favor, intenta de nuevo.");
  }, []);
  
  const register = useCallback(async (customerData: Omit<Customer, 'id'>) => {
    if (!customerData.email || !customerData.password || !customerData.name) {
        throw new Error("Nombre, correo y contraseña son requeridos.");
    }
    
    if (db.findCustomerByEmail(customerData.email)) {
        throw new Error("Ya existe una cuenta con este correo electrónico.");
    }

    const newCustomer = db.addOrUpdateCustomer(customerData);

    // Auto-login
    setUser({
        username: newCustomer.name,
        role: 'client',
        customerId: newCustomer.id,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};