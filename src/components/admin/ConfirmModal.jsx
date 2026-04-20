import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone. Please confirm to proceed.",
  confirmText = "Delete",
  type = "danger" 
}) {
  if (!isOpen) return null;

  const themes = {
    danger: "bg-red-500/20 text-red-500 border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
  };

  const btnThemes = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-500/30",
    warning: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/30"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass border border-white/10 p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <X size={20} />
        </button>

        <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center border ${themes[type]}`}>
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 font-medium leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg order-1 sm:order-2 ${btnThemes[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
