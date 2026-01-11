"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, ExternalLink, Bell, Settings } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    isDark?: boolean;
}

export default function DashboardHeader({ title, subtitle, showSearch = false, isDark = false }: DashboardHeaderProps) {
    const { user, logout } = useAuth();

    return (
        <header className={`mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className="flex-1">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">
                    <span>Dash</span>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span>{title}</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tight font-outfit">{title}</h1>
                {subtitle && <p className={`mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4">
                {/* Profile Summary Card */}
                <Link
                    href="/dashboard/profile"
                    className={`flex items-center gap-3 p-2 pr-4 rounded-2xl border transition shadow-sm group ${isDark
                            ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 shadow-slate-950/20'
                            : 'bg-white border-slate-100 hover:border-blue-400'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-inner ${isDark ? 'bg-slate-900' : 'bg-blue-50'
                        }`}>
                        {user?.picture ? (
                            <img src={user.picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-blue-600'}`} />
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className={`text-xs font-black uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {user?.name?.split(' ')[0] || 'User'}
                        </p>
                        <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {user?.role || 'Member'}
                        </p>
                    </div>
                    <Settings className={`w-4 h-4 transition ${isDark ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-blue-500'}`} />
                </Link>

                {/* Vertical Divider */}
                <div className={`w-px h-10 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                {/* Logout Button */}
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to log out?')) logout();
                    }}
                    className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 group ${isDark
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                            : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                        }`}
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
