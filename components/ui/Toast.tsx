'use client';

import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Props = {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
};

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const COLORS = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-900',
    progress: 'bg-green-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
    progress: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-900',
    progress: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-900',
    progress: 'bg-yellow-500',
  },
};

export default function Toast({ message, type = 'success', duration = 3000, onClose }: Props) {
  const colors = COLORS[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${colors.bg} ${colors.text} border-l-4 ${colors.border} rounded-lg shadow-lg p-4 max-w-md`}>
        <div className="flex items-start">
          <span className="text-2xl mr-3">{ICONS[type]}</span>
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.progress} animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
