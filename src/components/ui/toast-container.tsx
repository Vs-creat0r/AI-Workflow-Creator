import { useWorkflowStore } from "@/lib/store";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
    const toasts = useWorkflowStore((state) => state.toasts);
    const removeToast = useWorkflowStore((state) => state.removeToast);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-right-full fade-in duration-300 min-w-[300px]",
                        toast.type === 'success' && "bg-white/90 dark:bg-slate-900/90 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
                        toast.type === 'error' && "bg-white/90 dark:bg-slate-900/90 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
                        toast.type === 'info' && "bg-white/90 dark:bg-slate-900/90 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    )}
                >
                    {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}

                    <p className="flex-1 text-sm font-medium">{toast.title}</p>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 opacity-70" />
                    </button>
                </div>
            ))}
        </div>
    );
}
