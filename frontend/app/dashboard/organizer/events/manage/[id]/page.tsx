"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Calendar, MapPin, Users, Ticket, Clock,
    ChevronLeft, Loader2, CheckCircle, Info,
    Layers, Plus, Trash2, ArrowRight, Sparkles,
    GitBranch, GitCommit, GitPullRequest, Settings,
    BarChart3, DollarSign, UserCog
} from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";

export default function ManageEventPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<any>(null);
    const [branching, setBranching] = useState(false);
    const [branchName, setBranchName] = useState("");
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [expenseData, setExpenseData] = useState({ title: "", amount: 0, category: "Production" });
    const [submittingExpense, setSubmittingExpense] = useState(false);
    const [newBudgetTotal, setNewBudgetTotal] = useState(0);
    const [updatingBudget, setUpdatingBudget] = useState(false);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const [eventRes, branchesRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get(`/events?parentEvent=${id}`)
                ]);
                setEvent(eventRes.data.data);
                setBranches(branchesRes.data.data);
            } catch (err) {
                console.error("Failed to fetch event intel", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEventData();
    }, [id]);

    const handleCreateBranch = async () => {
        if (!branchName) return alert("Please specify the branch objective.");
        setBranching(true);
        try {
            const res = await api.post(`/events/${id}/branch`, { branchName });
            alert("New strategic branch successfully initialized.");
            setShowBranchModal(false);
            setBranchName("");
            router.push(`/dashboard/organizer/events/${res.data.data._id}`);
        } catch (err: any) {
            alert(err.response?.data?.error || "Branching sequence failed.");
        } finally {
            setBranching(false);
        }
    };

    const handleAddExpense = async () => {
        if (!expenseData.title || expenseData.amount <= 0) return alert("Please clarify expense details.");
        setSubmittingExpense(true);
        try {
            const res = await api.post(`/events/${id}/budget/expenses`, expenseData);
            setEvent({ ...event, budget: res.data.data });
            setExpenseData({ title: "", amount: 0, category: "Production" });
            alert("Operational expense successfully logged.");
            setShowBudgetModal(false);
        } catch (err: any) {
            alert(err.response?.data?.error || "Expense logging failed.");
        } finally {
            setSubmittingExpense(false);
        }
    };

    const handleUpdateBudgetTotal = async (amount: number) => {
        if (amount < 0) return alert("Strategic budget cannot be negative.");
        setUpdatingBudget(true);
        try {
            const res = await api.put(`/events/${id}`, { budget: { ...event.budget, total: amount } });
            setEvent(res.data.data);
            alert("Tactical budget total re-calibrated.");
        } catch (err: any) {
            alert(err.response?.data?.error || "Budget update failed.");
        } finally {
            setUpdatingBudget(false);
        }
    };

    const totalSpent = event.budget?.expenses?.reduce((acc: number, exp: any) => acc + exp.amount, 0) || 0;
    const remainingBalance = (event.budget?.total || 0) - totalSpent;
    const spentPercentage = Math.min(((totalSpent / (event.budget?.total || 1)) * 100), 100);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-32">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/organizer" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] transition-all group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Command Center
                    </Link>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowBranchModal(true)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 hover:bg-black transition-all"
                        >
                            <GitBranch size={16} /> Create Strategic Branch
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Event Map & Branches */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
                            <div className="space-y-6">
                                <div className="flex gap-4 items-center">
                                    <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        {event.category}
                                    </span>
                                    {event.isBranch && (
                                        <span className="px-5 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                                            <GitBranch size={12} /> Branch Initiative
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{event.title}</h1>

                                <div className="flex flex-wrap gap-8 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Calendar size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</p>
                                            <p className="text-sm font-bold text-slate-700 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><MapPin size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Location</p>
                                            <p className="text-sm font-bold text-slate-700 mt-1">{event.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Users size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Capacity</p>
                                            <p className="text-sm font-bold text-slate-700 mt-1">{event.capacity} Agents</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget Command Center */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <DollarSign size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">Budget Command Center</h3>
                                </div>
                                <button
                                    onClick={() => setShowBudgetModal(true)}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                                >
                                    <Plus size={16} /> Log Expense
                                </button>
                            </div>

                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Strategic Allocation</p>
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-3xl font-black text-slate-900">{event.budget?.total.toLocaleString()}</h4>
                                        <button
                                            onClick={() => {
                                                const val = prompt("Enter new Strategic Allocation Total:", event.budget?.total);
                                                if (val) handleUpdateBudgetTotal(parseInt(val));
                                            }}
                                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-blue-600 transition-all"
                                        >
                                            <Settings size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Expenditure</p>
                                    <h4 className="text-3xl font-black text-rose-500">{totalSpent.toLocaleString()}</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Reserve</p>
                                    <h4 className={`text-3xl font-black ${remainingBalance < 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                                        {remainingBalance.toLocaleString()}
                                    </h4>
                                </div>

                                <div className="md:col-span-3 space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Resource Depletion</span>
                                        <span className={spentPercentage > 90 ? 'text-rose-600' : 'text-slate-900'}>{spentPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${spentPercentage > 90 ? 'bg-rose-500' : (spentPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                                            style={{ width: `${spentPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Expense History Table */}
                            <div className="bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/20 border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-50">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tactical Expense Feed</h4>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {event.budget?.expenses?.map((exp: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{exp.title}</td>
                                                    <td className="px-8 py-5">
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                            {exp.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-rose-500">-{exp.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {(!event.budget?.expenses || event.budget.expenses.length === 0) && (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-bold italic">No tactical expenditures logged.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Branching Lineage */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <GitPullRequest size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Strategic Lineage</h3>
                            </div>

                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-100">
                                <div className="space-y-8 relative">
                                    <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-100" />

                                    {event.parentEvent && (
                                        <Link href={`/dashboard/organizer/events/${event.parentEvent}`} className="flex items-center gap-8 relative group">
                                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <GitCommit size={24} />
                                            </div>
                                            <div className="bg-slate-50 p-6 rounded-2xl flex-1 group-hover:bg-blue-50 transition-all border border-transparent group-hover:border-blue-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Operation</p>
                                                <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">Return to Base Protocol</h4>
                                            </div>
                                        </Link>
                                    )}

                                    <div className="flex items-center gap-8 relative">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-blue-100 shadow-xl shadow-blue-200 z-10 ring-4 ring-white">
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="bg-blue-600 p-8 rounded-[2rem] flex-1 text-white shadow-2xl shadow-blue-200 border-b-8 border-b-blue-800">
                                            <span className="px-4 py-1.5 bg-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Active Node</span>
                                            <h4 className="text-xl font-black mt-2">{event.title}</h4>
                                            <p className="text-white/60 text-xs font-bold mt-1">Current operational configuration being managed.</p>
                                        </div>
                                    </div>

                                    {branches.map(branch => (
                                        <Link key={branch._id} href={`/dashboard/organizer/events/${branch._id}`} className="flex items-center gap-8 relative group">
                                            <div className="w-12 h-12 bg-white text-emerald-500 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-md z-10 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <GitBranch size={24} />
                                            </div>
                                            <div className="bg-emerald-50/50 p-6 rounded-2xl flex-1 hover:bg-emerald-50 transition-all border border-emerald-100/50">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Contingency Branch</p>
                                                <h4 className="text-lg font-black text-slate-900">{branch.branchName || branch.title}</h4>
                                            </div>
                                        </Link>
                                    ))}

                                    {!branches.length && (
                                        <div className="flex items-center gap-8 opacity-40 grayscale">
                                            <div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                                                <GitBranch size={24} />
                                            </div>
                                            <div className="p-6 rounded-2xl flex-1 border-2 border-dashed border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Child Branches</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Area: Tactical Controls */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-10 space-y-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Settings size={20} className="text-slate-400" />
                                    Tactics HQ
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full p-6 bg-slate-50 hover:bg-blue-50 text-slate-900 rounded-2xl transition-all flex items-center justify-between group">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</p>
                                        <p className="text-sm font-black group-hover:text-blue-600 transition-colors">Edit Parameters</p>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </button>

                                <button className="w-full p-6 bg-slate-50 hover:bg-emerald-50 text-slate-900 rounded-2xl transition-all flex items-center justify-between group">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence</p>
                                        <p className="text-sm font-black group-hover:text-emerald-600 transition-colors">View Analytics</p>
                                    </div>
                                    <BarChart3 size={18} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                </button>

                                <button className="w-full p-6 bg-slate-50 hover:bg-amber-50 text-slate-900 rounded-2xl transition-all flex items-center justify-between group">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procurement</p>
                                        <p className="text-sm font-black group-hover:text-amber-600 transition-colors">Manage Vendors</p>
                                    </div>
                                    <UserCog size={18} className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>

                            <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6">
                                <div className="flex items-center justify-between">
                                    <DollarSign size={24} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Alpha</span>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black">{event.budget?.total.toLocaleString()}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Operational
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branch Modal */}
            {showBranchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
                        <div className="mb-8">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-6">
                                <GitBranch size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Initialize Branch</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Clone this operation into a tactical contingency plan with a separate trackable configuration.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Identity</label>
                                <input
                                    type="text" required
                                    value={branchName} onChange={(e) => setBranchName(e.target.value)}
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700"
                                    placeholder="e.g. Rainy Day Contingency"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowBranchModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                <button
                                    onClick={handleCreateBranch} disabled={branching}
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    {branching ? <Loader2 className="animate-spin" /> : <>Deploy Branch <ArrowRight size={18} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Logging Modal */}
            {showBudgetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
                        <div className="mb-8">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Log Expenditure</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Record a tactical expense against the current event operational budget.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Title</label>
                                <input
                                    type="text" required
                                    value={expenseData.title} onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700"
                                    placeholder="e.g. Venue AV Setup"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (NPR)</label>
                                    <input
                                        type="number" required min="1"
                                        value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: parseInt(e.target.value) })}
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Sector</label>
                                    <select
                                        value={expenseData.category} onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700 appearance-none"
                                    >
                                        {['Production', 'Marketing', 'Venue', 'Catering', 'Staffing', 'Other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowBudgetModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                <button
                                    onClick={handleAddExpense} disabled={submittingExpense}
                                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                                >
                                    {submittingExpense ? <Loader2 className="animate-spin" /> : <>Log Expense <ArrowRight size={18} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
