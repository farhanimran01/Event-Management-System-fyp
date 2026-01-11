'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
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
            const res = await api.get('/auth/me');
            setUser(res.data.data);
        } catch (err) {
            setUser(null);
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
            // Redirect based on role
            const role = res.data.user.role;
            if (role === 'Admin') router.push('/dashboard/admin');
            else if (role === 'Organizer') router.push('/dashboard/organizer');
            else if (role === 'Vendor') router.push('/dashboard/vendor');
            else router.push('/dashboard/attendee');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
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
            // Redirect based on role
            const role = res.data.user.role;
            if (role === 'Admin') router.push('/dashboard/admin');
            else if (role === 'Organizer') router.push('/dashboard/organizer');
            else if (role === 'Vendor') router.push('/dashboard/vendor');
            else router.push('/dashboard/attendee');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout'); // Need to implement this in backend if we want server-side cookie clear, or just clear client state
            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error(err);
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, error }}>
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
