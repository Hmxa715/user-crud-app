import type { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        
        {/* Close icon */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl leading-none bg-white"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
