import React from 'react';
import { CalendarDays, Menu, Plus } from 'lucide-react';
import { formatDate } from '../../Services/formatters';
import { ThemeSelector } from '../UI/ThemeSelector';

export const Navbar = ({ title, subtitle, onMenuClick, onQuickAction }) => (
    <header className="theme-surface sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3.5 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
            <button type="button" aria-label="Buka menu" onClick={onMenuClick} className="rounded-xl p-2 theme-text-muted theme-surface-hover lg:hidden">
                <Menu size={20} />
            </button>
            <div>
                <h2 className="text-lg font-bold leading-tight theme-text">{title}</h2>
                {subtitle && <p className="hidden text-xs theme-text-muted sm:block">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSelector />
            <div className="hidden items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium theme-border theme-text-secondary md:flex">
                <CalendarDays size={14} className="text-blue-500" />
                {formatDate(new Date(), { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <button type="button" onClick={() => onQuickAction('task')} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Tambah</span>
            </button>
        </div>
    </header>
);
