
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  const { isPageLoading } = useLoading();

  console.log('🔄 LoadingScreen render - isPageLoading:', isPageLoading);

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-[9999]">
      <div className="flex items-center justify-center">
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className="animate-spin"
          style={{ animationDuration: '1s' }}
        >
          <path
            d="M30 6 L36 24 L54 24 L39 36 L45 54 L30 42 L15 54 L21 36 L6 24 L24 24 Z"
            fill="white"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingScreen;
