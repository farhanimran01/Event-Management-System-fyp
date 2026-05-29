'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getErrorMessage, logError } from '@/lib/errorHandler';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    picture?: string;
    profileImage?: string;
    phone?: string;
    location?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check if user is logged in
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            // Restore token from localStorage if it exists
            const token = localStorage.getItem('token');
            if (token) {
                // Token will be added to request by axios interceptor
                const res = await api.get('/auth/me');
                setUser(res.data.data);
            }
        } catch (err) {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', data);
            setUser(res.data.user);
            
            // Store token in localStorage for Authorization header
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            
            // Redirect based on role with validation
            const role = res.data.user.role;
            const currentPath = window.location.pathname;
            
            // Validate role matches login portal
            if (currentPath.includes('/login/admin') && role !== 'Admin') {
                setError('Only Admin accounts can access the admin portal');
                setUser(null);
                localStorage.removeItem('token');
                throw new Error('Invalid role for admin portal');
            }
            
            if (currentPath.includes('/login/organizer') && role !== 'Organizer') {
                setError('Only Organizer accounts can access the organizer portal');
                setUser(null);
                localStorage.removeItem('token');
                throw new Error('Invalid role for organizer portal');
            }
            
            if (currentPath.includes('/login/user') && role !== 'User') {
                setError('Only User accounts can access the user portal');
                setUser(null);
                localStorage.removeItem('token');
                throw new Error('Invalid role for user portal');
            }
            
            // Perform role-based redirect
            if (role === 'Admin') router.push('/dashboard/admin');
            else if (role === 'Organizer') router.push('/dashboard/organizer');
            else router.push('/dashboard/user');
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            logError('Login', err, { email: data.email });
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', data);
            setUser(res.data.user);
            
            // Store token in localStorage for Authorization header
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            
            // Redirect based on role
            const role = res.data.user.role;
            if (role === 'Admin') router.push('/dashboard/admin');
            else if (role === 'Organizer') router.push('/dashboard/organizer');
            else router.push('/dashboard/user');
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            logError('Registration', err, { email: data.email });
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            // Clear token from localStorage
            localStorage.removeItem('token');
            router.push('/login');
        } catch (err) {
            console.error(err);
            setUser(null);
            router.push('/login');
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
