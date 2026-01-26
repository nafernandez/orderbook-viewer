'use client';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ERROR_MESSAGE =
  'Ocurrió un error. Podés seguir navegando mientras lo resolvemos.';

export function Toast({ isOpen, onClose }: ToastProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[90%] max-w-sm rounded-lg border border-red-800 bg-red-950/95 p-4 text-red-100 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Error</p>
          <p className="text-xs text-red-100/80 mt-1">
            {DEFAULT_ERROR_MESSAGE}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-red-700 px-2 py-1 text-xs font-medium text-red-100 transition-colors hover:bg-red-900"
          aria-label="Cerrar notificación"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}