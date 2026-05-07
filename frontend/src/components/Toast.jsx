import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export function useToast() {
    const [toasts, setToasts] = React.useState([]);

    const addToast = React.useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const dismissToast = React.useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, dismissToast };
}

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
};

const borderColors = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
};

function ToastItem({ toast, onDismiss }) {
    return (
        <div className={`
            flex items-center gap-3 bg-white rounded-xl shadow-lg
            border border-gray-200 border-l-4 ${borderColors[toast.type]}
            px-4 py-3 min-w-[280px] max-w-sm
        `}>
            {icons[toast.type]}
            <p className="text-sm font-medium text-slate-700 flex-1 leading-snug">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-1 shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function Toast({ toasts, onDismiss }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
