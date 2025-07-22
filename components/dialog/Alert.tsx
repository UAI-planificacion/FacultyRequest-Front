import { JSX } from "react";

export function AlertMessage({
    title,
    description,
    onClose,
}: {
    title: string;
    description?: string;
    onClose: () => void;
}): JSX.Element {
    return (
        <div 
            className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 max-w-3xl w-full mx-4 animate-in slide-in-from-bottom-2 duration-300"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className="dark:bg-black bg-white shadow-2xl shadow-red-500/20 rounded-md border-l-8 border-y-2 border-r-2 border-red-500 text-red-500 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg 
                            className="w-5 h-5 mr-2" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{title}</span>
                    </div>

                    <button 
                        onClick={onClose}
                        className="text-red-700 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-900 rounded-full transition-colors duration-200"
                        aria-label="Cerrar alerta"
                        type="button"
                    >
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {
                    description && (
                        <p className="mt-2 text-sm text-red-500">{description}</p>
                    )
                }
            </div>
        </div>
    );
}