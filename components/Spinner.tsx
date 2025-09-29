import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-700 border-t-gray-200`}
      ></div>
      {message && <p className="text-gray-400 text-sm font-medium">{message}</p>}
    </div>
  );
};