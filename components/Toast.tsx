import React, { useContext, useEffect, useState } from 'react';
import { ToastContext, Toast } from '../context/ToastContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationCircleIcon } from './icons';

const ICONS: { [key: string]: React.ReactNode } = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
  error: <XCircleIcon className="w-6 h-6 text-red-400" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-400" />,
  warning: <ExclamationCircleIcon className="w-6 h-6 text-yellow-400" />,
};

const ToastMessage: React.FC<{ toast: Toast; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for animation
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const animationClass = isExiting ? 'animate-[toast-out-right_0.3s_ease-in_forwards]' : 'animate-[toast-in-right_0.3s_ease-out_forwards]';

  return (
    <div
      className={`relative w-full max-w-sm bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden ${animationClass}`}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">{ICONS[toast.type]}</div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-semibold text-gray-100">{toast.title}</p>
          {toast.message && <p className="mt-1 text-sm text-gray-400">{toast.message}</p>}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleRemove}
            className="inline-flex rounded-md text-gray-500 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[1000]"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map(toast => (
          <ToastMessage key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
};
