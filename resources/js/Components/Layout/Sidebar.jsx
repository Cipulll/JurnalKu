import React from 'react';
import {
    CheckSquare,
    FileText,
    LayoutDashboard,
    LogOut,
    PieChart,
    Plus,
    Sparkles,
    Wallet,
    X,
} from 'lucide-react';
import { cn } from '../../Services/formatters';

const navigationItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
    { id: 'notes', label: 'Catatan & Jurnal', icon: FileText },
    { id: 'reports', label: 'Laporan', icon: PieChart },
];

export const Sidebar = ({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, onQuickAction, user, onLogout }) => (
    <>
        {isMobileOpen && (
            <button
                type="button"
                aria-label="Tutup menu"
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
                onClick={() => setIsMobileOpen(false)}
            />
        )}
        <aside
            className={cn(
                'theme-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0',
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}
        >
            <div className="p-5">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                            <Sparkles size={19} />
                        </div>
                        <div>
                            <h1 className="font-extrabold tracking-tight theme-text">Jurnal<span className="text-blue-600">Ku</span></h1>
                            <p className="mt-0.5 text-[11px] theme-text-muted">Ruang kecil untuk bertumbuh</p>
                        </div>
                    </div>
                    <button type="button" aria-label="Tutup menu" onClick={() => setIsMobileOpen(false)} className="rounded-lg p-2 theme-text-muted lg:hidden">
                        <X size={18} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => onQuickAction('task')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                    <Plus size={17} strokeWidth={2.5} />
                    Tambah tugas
                </button>

                <p className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.16em] theme-text-muted">Menu utama</p>
                <nav aria-label="Menu utama" className="space-y-1">
                    {navigationItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            aria-current={activePage === id ? 'page' : undefined}
                            onClick={() => {
                                setActivePage(id);
                                setIsMobileOpen(false);
                            }}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition',
                                activePage === id
                                    ? 'bg-blue-600/10 text-blue-700'
                                    : 'theme-text-secondary theme-surface-hover'
                            )}
                        >
                            <Icon size={17} className={activePage === id ? 'text-blue-600' : 'theme-text-muted'} />
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="border-t p-4 theme-border">
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">{user?.name?.charAt(0)?.toUpperCase() || 'J'}</div>
                    <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold theme-text">{user?.name}</p>
                    <p className="truncate text-xs theme-text-muted">{user?.email}</p>
                    </div>
                <button type="button" onClick={onLogout} title="Keluar dari akun" aria-label="Keluar dari akun" className="rounded-lg p-2 theme-text-muted transition hover:bg-rose-50 hover:text-rose-600">
                    <LogOut size={16} />
                </button>
                </div>
            </div>
        </aside>
    </>
);
