/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  X,
  Paperclip,
  Trash2,
  Edit2,
  LogOut,
  Search,
  List,
  BarChart3,
  Download,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Expense, ExpenseAttachment } from '../types';
import {
  dbFetchExpenses,
  dbSaveExpense,
  dbDeleteExpense,
  dbUploadExpenseAttachment,
  dbGetExpenseAttachmentUrls
} from '../supabaseService';
import { getSupabase } from '../supabaseClient';
import { safeRemoveItem } from '../utils/safeStorage';
import Lightbox from './Lightbox';

interface AccountBookViewProps {
  currentUserEmail: string;
  currentUserName: string;
  onLogout: () => void;
}

const currency = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AccountBookView({ currentUserEmail, currentUserName, onLogout }: AccountBookViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<'list' | 'reports'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formId, setFormId] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formPurpose, setFormPurpose] = useState('');
  const [formPaidTo, setFormPaidTo] = useState('');
  const [formPaidBy, setFormPaidBy] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formRemark, setFormRemark] = useState('');
  const [formAttachments, setFormAttachments] = useState<ExpenseAttachment[]>([]);
  // Editing an entry shouldn't silently reassign who originally logged it —
  // only new entries get attributed to the currently logged-in user.
  const [formOriginalAddedBy, setFormOriginalAddedBy] = useState<{ email: string; name: string } | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [lightboxState, setLightboxState] = useState<{ images: { url: string; name: string }[]; index: number } | null>(null);

  const loadExpenses = async () => {
    setIsLoading(true);
    setLoadError(null);
    const data = await dbFetchExpenses();
    if (data === null) {
      setLoadError('Could not load expenses from the cloud database. Check your connection and try again.');
      setExpenses([]);
    } else {
      setExpenses(data);
      const allPaths = data.flatMap((e) => (e.attachments || []).map((a) => a.path));
      if (allPaths.length > 0) {
        const urls = await dbGetExpenseAttachmentUrls(allPaths);
        setAttachmentUrls((prev) => ({ ...prev, ...urls }));
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const resetForm = () => {
    setFormId('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormPurpose('');
    setFormPaidTo('');
    setFormPaidBy('');
    setFormAmount('');
    setFormRemark('');
    setFormAttachments([]);
    setFormError(null);
    setIsEditMode(false);
    setFormOriginalAddedBy(null);
  };

  const openForm = () => {
    resetForm();
    setFormId(`exp-${Date.now()}`);
    setShowForm(true);
  };

  const openEditForm = (expense: Expense) => {
    setFormId(expense.id);
    setFormDate(expense.date);
    setFormPurpose(expense.purpose);
    setFormPaidTo(expense.paidTo || '');
    setFormPaidBy(expense.paidBy || '');
    setFormAmount(String(expense.amount ?? ''));
    setFormRemark(expense.remark || '');
    setFormAttachments(expense.attachments || []);
    setFormError(null);
    setIsEditMode(true);
    setFormOriginalAddedBy({ email: expense.addedByEmail, name: expense.addedByName });
    setShowForm(true);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    e.target.value = '';

    setFormError(null);
    setIsUploadingAttachment(true);
    try {
      for (const file of fileList) {
        const uploaded = await dbUploadExpenseAttachment(formId, file);
        if (!uploaded) {
          setFormError(`Failed to upload "${file.name}". It may exceed the 10MB limit.`);
          continue;
        }
        setFormAttachments((prev) => [...prev, uploaded]);
        const urls = await dbGetExpenseAttachmentUrls([uploaded.path]);
        setAttachmentUrls((prev) => ({ ...prev, ...urls }));
      }
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleRemoveFormAttachment = async (path: string) => {
    setFormAttachments((prev) => prev.filter((a) => a.path !== path));
    const supabase = getSupabase();
    if (supabase) {
      supabase.storage.from('expense-attachments').remove([path]).catch(() => {});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formDate || !formPurpose.trim()) {
      setFormError('Date and Purpose are required.');
      return;
    }
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    setIsSaving(true);
    const expense: Expense = {
      id: formId,
      date: formDate,
      purpose: formPurpose.trim(),
      paidTo: formPaidTo.trim(),
      paidBy: formPaidBy.trim(),
      amount: amountNum,
      remark: formRemark.trim() || undefined,
      attachments: formAttachments,
      addedByEmail: formOriginalAddedBy?.email || currentUserEmail,
      addedByName: formOriginalAddedBy?.name || currentUserName,
      createdAt: new Date().toISOString()
    };

    const ok = await dbSaveExpense(expense);
    setIsSaving(false);

    if (!ok) {
      setFormError('Failed to save this entry to the cloud database. Please try again.');
      return;
    }

    setShowForm(false);
    resetForm();
    await loadExpenses();
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm(`Delete this expense entry ("${expense.purpose}")? This cannot be undone.`)) return;
    const supabase = getSupabase();
    const paths = (expense.attachments || []).map((a) => a.path);
    if (supabase && paths.length > 0) {
      supabase.storage.from('expense-attachments').remove(paths).catch(() => {});
    }
    const ok = await dbDeleteExpense(expense.id);
    if (ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    } else {
      alert('Failed to delete this entry from the cloud database.');
    }
  };

  const openLightbox = (expense: Expense, index: number) => {
    const images = (expense.attachments || []).map((a) => ({
      url: attachmentUrls[a.path] || '',
      name: a.name
    }));
    setLightboxState({ images, index });
  };

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter(
      (e) =>
        e.purpose.toLowerCase().includes(q) ||
        (e.paidTo || '').toLowerCase().includes(q) ||
        (e.paidBy || '').toLowerCase().includes(q) ||
        (e.remark || '').toLowerCase().includes(q) ||
        (e.addedByName || '').toLowerCase().includes(q)
    );
  }, [expenses, searchQuery]);

  const reports = useMemo(() => {
    const totalAll = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totalThisMonth = expenses
      .filter((e) => (e.date || '').slice(0, 7) === thisMonthKey)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const byPaidByStats: Record<string, { count: number; total: number }> = {};
    expenses.forEach((e) => {
      const key = e.paidBy?.trim() || 'Unspecified';
      if (!byPaidByStats[key]) byPaidByStats[key] = { count: 0, total: 0 };
      byPaidByStats[key].count += 1;
      byPaidByStats[key].total += e.amount || 0;
    });

    const byPaidTo: Record<string, { count: number; total: number }> = {};
    expenses.forEach((e) => {
      const key = e.paidTo?.trim() || 'Unspecified';
      if (!byPaidTo[key]) byPaidTo[key] = { count: 0, total: 0 };
      byPaidTo[key].count += 1;
      byPaidTo[key].total += e.amount || 0;
    });

    return {
      totalAll,
      totalThisMonth,
      count: expenses.length,
      byPaidBy: Object.entries(byPaidByStats).sort((a, b) => b[1].total - a[1].total),
      byPaidTo: Object.entries(byPaidTo).sort((a, b) => b[1].total - a[1].total).slice(0, 10)
    };
  }, [expenses]);

  const handleExportCsv = () => {
    const header = ['Date', 'Purpose', 'Paid To', 'Paid By', 'Amount', 'Remark', 'Added By', 'Added By Email'];
    const rows = expenses.map((e) => [
      e.date,
      e.purpose,
      e.paidTo,
      e.paidBy,
      e.amount.toFixed(2),
      e.remark || '',
      e.addedByName,
      e.addedByEmail
    ]);
    const escapeCell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fierystone-account-book-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    safeRemoveItem('fstone_secure_session_active');
    safeRemoveItem('fstone_secure_user_email');
    safeRemoveItem('fstone_secure_user_name');
    const supabase = getSupabase();
    if (supabase) supabase.auth.signOut().catch(() => {});
    onLogout();
  };

  return (
    <div id="account-book-view" className="min-h-screen bg-stone-950 text-stone-200 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-stone-850 bg-stone-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white leading-none">Account Book</h1>
              <p className="text-[10px] text-stone-500 font-mono mt-0.5">{currentUserName}</p>
            </div>
          </div>
          <button
            id="btn-secure-logout"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-5">
        {/* TABS + ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-850 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'list' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'reports' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Reports
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={expenses.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider transition disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              id="btn-add-expense"
              onClick={openForm}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Expense
            </button>
          </div>
        </div>

        {loadError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{loadError}</span>
            <button onClick={loadExpenses} className="underline hover:text-rose-200 font-semibold flex-shrink-0">Retry</button>
          </div>
        )}

        {activeTab === 'list' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by purpose, paid to, paid by, or added by..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-800 bg-stone-900 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="p-10 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading expenses...
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-10 text-center text-stone-500 text-xs">
                  {expenses.length === 0 ? 'No expenses recorded yet.' : 'No entries match your search.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-850 text-stone-500 uppercase text-[10px] tracking-wider">
                        <th className="text-left font-bold px-4 py-3">Date</th>
                        <th className="text-left font-bold px-4 py-3">Purpose</th>
                        <th className="text-left font-bold px-4 py-3">Paid To</th>
                        <th className="text-left font-bold px-4 py-3">Paid By</th>
                        <th className="text-right font-bold px-4 py-3">Amount</th>
                        <th className="text-left font-bold px-4 py-3">Attachments</th>
                        <th className="text-left font-bold px-4 py-3">Added By</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="border-b border-stone-850/60 hover:bg-stone-850/30 transition">
                          <td className="px-4 py-3 text-stone-300 font-mono whitespace-nowrap">{exp.date}</td>
                          <td className="px-4 py-3 text-stone-200 font-medium max-w-[220px]">
                            <p className="truncate" title={exp.purpose}>{exp.purpose}</p>
                            {exp.remark && (
                              <p className="text-[10px] text-stone-500 italic truncate mt-0.5" title={exp.remark}>{exp.remark}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-400">{exp.paidTo || '—'}</td>
                          <td className="px-4 py-3 text-stone-400">{exp.paidBy || '—'}</td>
                          <td className="px-4 py-3 text-right text-amber-500 font-bold font-mono whitespace-nowrap">{currency(exp.amount)}</td>
                          <td className="px-4 py-3">
                            {exp.attachments && exp.attachments.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {exp.attachments.slice(0, 3).map((att, idx) => (
                                  <button
                                    key={att.path}
                                    onClick={() => openLightbox(exp, idx)}
                                    className="h-8 w-8 rounded border border-stone-800 overflow-hidden bg-stone-950 flex items-center justify-center hover:border-amber-500/50 transition flex-shrink-0"
                                    title={att.name}
                                  >
                                    {attachmentUrls[att.path] ? (
                                      <img src={attachmentUrls[att.path]} alt={att.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <ImageIcon className="h-3.5 w-3.5 text-stone-600" />
                                    )}
                                  </button>
                                ))}
                                {exp.attachments.length > 3 && (
                                  <button
                                    onClick={() => openLightbox(exp, 3)}
                                    className="text-[10px] text-stone-500 hover:text-amber-500 font-mono px-1"
                                  >
                                    +{exp.attachments.length - 3}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-stone-700">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-400 whitespace-nowrap">{exp.addedByName || exp.addedByEmail}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditForm(exp)}
                              className="text-stone-600 hover:text-amber-400 transition p-1"
                              title="Edit entry"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp)}
                              className="text-stone-600 hover:text-rose-400 transition p-1"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-stone-900 border border-stone-850 rounded-xl p-5">
                <p className="text-[10px] text-stone-500 uppercase font-mono tracking-wider mb-1.5">Total All-Time</p>
                <p className="text-2xl font-black text-amber-500 font-mono">{currency(reports.totalAll)}</p>
              </div>
              <div className="bg-stone-900 border border-stone-850 rounded-xl p-5">
                <p className="text-[10px] text-stone-500 uppercase font-mono tracking-wider mb-1.5">This Month</p>
                <p className="text-2xl font-black text-white font-mono">{currency(reports.totalThisMonth)}</p>
              </div>
              <div className="bg-stone-900 border border-stone-850 rounded-xl p-5">
                <p className="text-[10px] text-stone-500 uppercase font-mono tracking-wider mb-1.5">Total Entries</p>
                <p className="text-2xl font-black text-white font-mono">{reports.count}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-stone-900 border border-stone-850 rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-3 border-b border-stone-850 pb-2.5">By Paid By</h3>
                {reports.byPaidBy.length === 0 ? (
                  <p className="text-xs text-stone-600 py-2">No data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reports.byPaidBy.map(([name, stat]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-stone-300">{name} <span className="text-stone-600 font-mono">({stat.count})</span></span>
                        <span className="text-amber-500 font-bold font-mono">{currency(stat.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-stone-900 border border-stone-850 rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-3 border-b border-stone-850 pb-2.5">Top Paid To</h3>
                {reports.byPaidTo.length === 0 ? (
                  <p className="text-xs text-stone-600 py-2">No data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reports.byPaidTo.map(([name, stat]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-stone-300">{name} <span className="text-stone-600 font-mono">({stat.count})</span></span>
                        <span className="text-amber-500 font-bold font-mono">{currency(stat.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD EXPENSE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[90] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-850 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">{isEditMode ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-500 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Purpose *</label>
                <input
                  type="text"
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Diesel for quarry transport"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Paid To</label>
                  <input
                    type="text"
                    value={formPaidTo}
                    onChange={(e) => setFormPaidTo(e.target.value)}
                    placeholder="Vendor / person"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Paid By</label>
                  <input
                    type="text"
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    placeholder="Payer name"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Remark <span className="normal-case text-stone-600">(optional)</span></label>
                <textarea
                  value={formRemark}
                  onChange={(e) => setFormRemark(e.target.value)}
                  placeholder="Any additional notes about this entry..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 text-xs resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-stone-400 uppercase text-[9px] font-bold">Attachments (Screenshots)</label>
                  <span className="text-[10px] text-amber-500 font-mono">{formAttachments.length} Linked</span>
                </div>

                <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 bg-stone-950/40 rounded-xl p-4 text-center cursor-pointer transition relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAttachmentUpload}
                    disabled={isUploadingAttachment}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <p className="text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" />
                    {isUploadingAttachment ? 'Uploading…' : 'Click to Attach Screenshots (max 10MB each)'}
                  </p>
                </div>

                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formAttachments.map((att) => (
                      <div key={att.path} className="relative h-14 w-14 rounded border border-stone-800 overflow-hidden bg-stone-950 flex-shrink-0 group">
                        {attachmentUrls[att.path] ? (
                          <img src={attachmentUrls[att.path]} alt={att.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-stone-600" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFormAttachment(att.path)}
                          className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                        >
                          <X className="h-4 w-4 text-rose-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-stone-950/60 border border-stone-850 p-3 text-[10px] text-stone-500">
                {isEditMode ? (
                  <>
                    Originally logged by <span className="text-stone-300 font-semibold">{formOriginalAddedBy?.name}</span> — edited by <span className="text-stone-300 font-semibold">{currentUserName}</span>
                  </>
                ) : (
                  <>
                    Logged by <span className="text-stone-300 font-semibold">{currentUserName}</span> ({currentUserEmail})
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving || isUploadingAttachment}
                className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : isEditMode ? (
                  'Update Expense'
                ) : (
                  'Save Expense'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxState && (
        <Lightbox
          images={lightboxState.images}
          activeIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
          onNavigate={(index) => setLightboxState((prev) => (prev ? { ...prev, index } : prev))}
        />
      )}
    </div>
  );
}
