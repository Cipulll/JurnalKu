import React, { useState } from 'react';
import { useTheme } from '../../Contexts/ThemeContext';
import { Modal } from './Modal';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { cn } from '../../Services/formatters';

export const ThemeSelector = () => {
    const { theme, setTheme, themes, isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const activeThemeObj = themes.find((t) => t.id === theme) || themes[0];

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border theme-border theme-surface theme-surface-hover transition-all text-xs font-semibold"
                title="Ganti Tema & Warna Latar"
            >
                <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                    style={{ backgroundColor: activeThemeObj.bgPreview }}
                />
                <span className="hidden sm:inline theme-text">{activeThemeObj.name}</span>
                <Palette className="w-3.5 h-3.5 theme-text-muted" />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Pilih Tema & Warna Latar Belakang"
                description="Sesuaikan tampilan JurnalKu agar sejuk, rapi, dan paling nyaman di mata Anda."
                maxWidth="md"
            >
                <div className="space-y-4 pt-1">
                    {/* Light Themes Section */}
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-2.5">
                            <Sun className="w-3.5 h-3.5" />
                            <span>Tema Terang & Hangat (Eye Comfort)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {themes.filter((t) => t.category === 'light').map((t) => {
                                const isSelected = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setTheme(t.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2',
                                            isSelected
                                                ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-5 h-5 rounded-full border border-black/15 shadow-inner"
                                                    style={{ backgroundColor: t.bgPreview }}
                                                />
                                                <span className="text-xs font-bold text-slate-900">{t.name}</span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <p className="text-[10px] text-slate-500 line-clamp-1">{t.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dark Themes Section */}
                    <div className="pt-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 mb-2.5">
                            <Moon className="w-3.5 h-3.5" />
                            <span>Tema Gelap / Dark Mode</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {themes.filter((t) => t.category === 'dark').map((t) => {
                                const isSelected = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setTheme(t.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2',
                                            isSelected
                                                ? 'border-blue-500 ring-2 ring-blue-500/30 bg-slate-800'
                                                : 'border-slate-700 hover:border-slate-600 bg-slate-900'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                                                    style={{ backgroundColor: t.bgPreview }}
                                                />
                                                <span className="text-xs font-bold text-white">{t.name}</span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <p className="text-[10px] text-slate-400 line-clamp-1">{t.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};
