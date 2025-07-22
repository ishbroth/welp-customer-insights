
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingScreen: React.FC = () => {
  const { isPageLoading } = useLoading();

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
