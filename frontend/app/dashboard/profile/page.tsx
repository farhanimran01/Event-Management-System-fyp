"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { User, Phone, MapPin, Camera, Lock, CheckCircle, AlertCircle, Save, X, Loader2 } from "lucide-react";

interface ProfileData {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    picture: string;
    role: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", location: "" });
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/profile");
            setProfile(res.data.data);
            setFormData({
                name: res.data.data.name,
                phone: res.data.data.phone || "",
                location: res.data.data.location || ""
            });
        } catch (err: any) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put("/profile/update", formData);
            console.log('--- STEP 4: Frontend Received Response ---');
            console.log('Data:', res.data);

            setProfile(res.data.data);
            console.log('--- STEP 5: Frontend State Updated (Profile set) ---');

            setIsEditing(false);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err: any) {
            console.error('--- STEP 4 FAILED: Frontend API Error ---', err);
            setMessage({ type: "error", text: err.response?.data?.error || "Update failed" });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: "error", text: "Passwords do not match" });
        }
        try {
            await api.put("/profile/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setMessage({ type: "success", text: "Password changed successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.error || "Password change failed" });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        setUploading(true);
        try {
            const res = await api.post("/profile/upload", uploadFormData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const imageUrl = res.data.data;

            await api.put("/profile/update", { profileImage: imageUrl });
            setProfile(prev => prev ? { ...prev, picture: imageUrl } : null);
            setMessage({ type: "success", text: "Profile picture updated!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.error || "Profile picture update failed. Please try again."
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-medium animate-pulse">Loading secure profile...</p>
        </div>
    );

    if (!profile) return (
        <div className="p-12 text-center">
            <div className="bg-rose-50 text-rose-600 p-8 rounded-3xl border border-rose-100 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Access Error</h3>
                <p>We couldn't retrieve your profile information. Please try logging in again.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <nav className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-blue-600 font-medium">Profile Settings</span>
                    </nav>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your identity, security, and preferences across the platform.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 hover:-translate-y-0.5"
                    >
                        Edit Profile Details
                    </button>
                )}
            </header>

            {message.text && (
                <div className={`fixed top-10 right-10 z-50 p-5 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-right duration-300 ${message.type === 'success' ? 'bg-white text-emerald-600 border border-emerald-100' : 'bg-white text-rose-600 border border-rose-100'}`}>
                    {message.type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
                    <div>
                        <p className="font-black text-sm uppercase tracking-wider">{message.type === 'success' ? 'Success' : 'Attention'}</p>
                        <p className="font-medium text-slate-600">{message.text}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Visual Profile */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-5" />

                        <div className="relative mt-4">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white bg-slate-50 shadow-2xl relative transition-transform duration-500 group-hover:scale-105">
                                {profile.picture ? (
                                    <img src={profile.picture} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <User size={80} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 z-10">
                                <Camera size={20} />
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm z-20">
                                    <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 space-y-1">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
                            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                                {profile.role}
                            </span>
                        </div>

                        <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-100">
                                    <X size={18} className="text-slate-400 rotate-45" /> {/* Using X as placeholder for mail/phone icon if not imported */}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-slate-700 truncate w-40">{profile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-100">
                                    <Phone size={18} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-bold text-slate-700">{profile.phone || "Not set"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Member Since</p>
                        <p className="text-slate-600 font-bold">{new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                    </div>
                </div>

                {/* Right Column: Interactive Forms */}
                <div className="lg:col-span-8 space-y-10">
                    <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                                <User size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Full Identity</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 disabled:bg-slate-50/50"
                                        placeholder="Enter your legal name"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-wider ml-1">Email (Immutable)</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profile.email}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-400 font-bold outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 disabled:bg-slate-50/50"
                                        placeholder="+00 (000) 000-0000"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Primary Residence</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 disabled:bg-slate-50/50"
                                        placeholder="e.g., London, UK"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all font-black flex items-center justify-center gap-3"
                                    >
                                        <Save size={20} />
                                        Commit Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: profile.name, phone: profile.phone || "", location: profile.location || "" });
                                        }}
                                        className="px-8 py-4 bg-white text-slate-600 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all font-black"
                                    >
                                        Discard
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>

                    <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-l-8 border-l-amber-500">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Credentials</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-8">
                            <div className="space-y-2.5">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all font-bold text-slate-700"
                                    placeholder="Verify your existing password"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">New Secret Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all font-bold text-slate-700"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Confirm Secret Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all font-bold text-slate-700"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-8 py-5 bg-slate-900 text-white rounded-2xl hover:bg-black hover:shadow-2xl hover:shadow-slate-300 transition-all font-black flex items-center justify-center gap-3"
                            >
                                <Lock size={20} />
                                Refresh Security Token
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}
