'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

// Context for dropdown state
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
}

// Main DropdownMenu wrapper
interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Close on Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Trigger button
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuTrigger({ children, className = '' }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
        text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300
        dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-colors ${className}`}
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
}

// Content container
interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export function DropdownMenuContent({ children, align = 'right' }: DropdownMenuContentProps) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      className={`absolute ${alignmentClass} mt-2 w-56 origin-top-right rounded-lg bg-white
        dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50
        animate-in fade-in slide-in-from-top-2 duration-200`}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

// Menu item
interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  className = '',
}: DropdownMenuItemProps) {
  const { setIsOpen } = useDropdown();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2
        ${
          disabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        transition-colors ${className}`}
      role="menuitem"
    >
      {children}
    </button>
  );
}

// Separator
export function DropdownMenuSeparator() {
  return <div className="h-px my-1 bg-gray-200 dark:bg-gray-700" role="separator" />;
}
