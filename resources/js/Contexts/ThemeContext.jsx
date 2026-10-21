import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEME_OPTIONS = [
    {
        id: 'light',
        name: 'Pure Clean',
        description: 'Terang modern & nyaman untuk siang hari',
        category: 'light',
        bgPreview: '#f8fafc',
        surfacePreview: '#ffffff',
        accentColor: '#2563eb',
        textColor: '#0f172a',
    },
    {
        id: 'warm',
        name: 'Warm Paper (Krem)',
        description: 'Paling lembut di mata, ala buku catatan Notion',
        category: 'light',
        bgPreview: '#fbf9f5',
        surfacePreview: '#ffffff',
        accentColor: '#d97706',
        textColor: '#292524',
    },
    {
        id: 'sage',
        name: 'Soft Sage (Mint)',
        description: 'Nuansa hijau sage sejuk & menenangkan pikiran',
        category: 'light',
        bgPreview: '#f2f6f4',
        surfacePreview: '#ffffff',
        accentColor: '#059669',
        textColor: '#1c2e24',
    },
    {
        id: 'lavender',
        name: 'Soft Lavender',
        description: 'Pastel lembut berkarakter modern elegan',
        category: 'light',
        bgPreview: '#f7f6fb',
        surfacePreview: '#ffffff',
        accentColor: '#7c3aed',
        textColor: '#241c30',
    },
    {
        id: 'dark-slate',
        name: 'Midnight Slate',
        description: 'Dark mode seimbang dengan saturasi lembut',
        category: 'dark',
        bgPreview: '#0b1120',
        surfacePreview: '#131c31',
        accentColor: '#3b82f6',
        textColor: '#f8fafc',
    },
    {
        id: 'dark-forest',
        name: 'Nordic Forest',
        description: 'Gelap bernuansa emerald alami untuk malam',
        category: 'dark',
        bgPreview: '#071510',
        surfacePreview: '#0e231b',
        accentColor: '#10b981',
        textColor: '#ecfdf5',
    },
    {
        id: 'dark-oled',
        name: 'Jet Black OLED',
        description: 'Kontras maksimal hitam murni hemat daya',
        category: 'dark',
        bgPreview: '#000000',
        surfacePreview: '#121212',
        accentColor: '#60a5fa',
        textColor: '#ffffff',
    },
];

export const ThemeProvider = ({ children }) => {
    // Default to 'light' (or 'warm') which is universally loved and clean
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('jurnalku_theme') || 'warm';
    });

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('jurnalku_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        if (newTheme.startsWith('dark-')) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme.startsWith('dark-')) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const isDark = theme.startsWith('dark-');

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
