
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingScreen: React.FC = () => {
  const { isPageLoading } = useLoading();

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingScreen;
