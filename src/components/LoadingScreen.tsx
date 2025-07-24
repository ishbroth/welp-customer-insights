
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingScreen: React.FC = () => {
  const { isPageLoading } = useLoading();

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-8 rounded-lg shadow-lg flex items-center justify-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="animate-spin"
          style={{ animationDuration: '1s' }}
        >
          <path
            d="M20 4 L24 16 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 16 Z"
            fill="#9b87f5"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingScreen;
