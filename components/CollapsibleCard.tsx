'use client';

import { useState } from 'react';

interface CollapsibleCardProps {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleCard({
  title,
  icon,
  defaultOpen = true,
  children
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors md:cursor-default md:pointer-events-none"
        aria-expanded={isOpen}
        aria-controls={`card-content-${title}`}
      >
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h3>
        <span
          className="text-gray-400 text-2xl transition-transform md:hidden"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      <div
        id={`card-content-${title}`}
        className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen
            ? 'max-h-screen opacity-100 pb-6'
            : 'max-h-0 opacity-0 pb-0 md:max-h-screen md:opacity-100 md:pb-6'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
