"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { User, Phone, MapPin, Camera, Lock, CheckCircle, AlertCircle, Save, X } from "lucide-react";

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
            setProfile(res.data.data);
            setIsEditing(false);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err: any) {
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

            // Now update profile with new image URL
            await api.put("/profile/update", { profileImage: imageUrl });
            setProfile(prev => prev ? { ...prev, picture: imageUrl } : null);
            setMessage({ type: "success", text: "Profile picture updated!" });
        } catch (err: any) {
            setMessage({ type: "error", text: "Upload failed" });
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12">Loading Profile...</div>;
    if (!profile) return <div className="p-12 text-center text-red-500">Profile not found.</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit">My Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your personal information and security</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Edit Profile
                    </button>
                )}
            </header>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{message.text}</p>
                    <button onClick={() => setMessage({ type: "", text: "" })} className="ml-auto">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100">
                                {profile.picture ? (
                                    <img src={profile.picture} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition">
                                <Camera size={18} className="text-blue-600" />
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold mt-4 text-slate-800">{profile.name}</h2>
                        <p className="text-slate-500 font-medium text-sm">{profile.role}</p>
                        <p className="text-slate-400 text-xs mt-1">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 text-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                            <User size={18} className="text-slate-400" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Phone size={18} className="text-slate-400" />
                            <span>{profile.phone || "No phone added"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin size={18} className="text-slate-400" />
                            <span>{profile.location || "No location added"}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form & Password */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info Form */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <User className="text-blue-600" size={22} />
                            Basic Information
                        </h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Address (Read-only)</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profile.email}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Primary Location</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: profile.name, phone: profile.phone || "", location: profile.location || "" });
                                        }}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Security Form */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Lock className="text-amber-500" size={22} />
                            Security & Password
                        </h2>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-bold flex items-center justify-center gap-2"
                            >
                                <Lock size={18} />
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
