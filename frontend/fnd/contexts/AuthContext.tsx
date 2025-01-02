"use client"

import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    userId: null
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const isAuthenticated = !!userId;

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 