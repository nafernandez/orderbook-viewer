'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast } from '@/components/Toast';

interface ErrorToastContextValue {
  showError: () => void;
  dismiss: () => void;
}

const ErrorToastContext = createContext<ErrorToastContextValue | undefined>(
  undefined
);

const TOAST_DURATION_MS = 5000;

export function ErrorToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setIsOpen(false);
  }, [clearTimer]);

  const showError = useCallback(() => {
    clearTimer();
    setIsOpen(true);
    timerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      timerRef.current = null;
    }, TOAST_DURATION_MS);
  }, [clearTimer]);

  return (
    <ErrorToastContext.Provider value={{ showError, dismiss }}>
      {children}
      <Toast isOpen={isOpen} onClose={dismiss} />
    </ErrorToastContext.Provider>
  );
}

export function useErrorToast() {
  const context = useContext(ErrorToastContext);
  if (!context) {
    throw new Error('useErrorToast must be used within ErrorToastProvider');
  }
  return context;
}