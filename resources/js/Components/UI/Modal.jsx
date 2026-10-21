import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../Services/formatters';

export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'md',
    showCloseButton = true,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div
                className={cn(
                    'relative w-full theme-surface rounded-3xl shadow-xl border theme-border p-6 transition-all transform scale-100 z-10',
                    maxWidths[maxWidth] || maxWidths.md
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between pb-4 border-b theme-border mb-4">
                        <div>
                            {title && (
                                <h3 className="text-lg font-bold theme-text tracking-tight">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-xs theme-text-muted mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-xl theme-text-muted hover:theme-text theme-surface-hover transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};
