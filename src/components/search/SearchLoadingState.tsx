import React from 'react';
import WelpLoadingIcon from '@/components/ui/WelpLoadingIcon';

const SearchLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center py-12">
      <WelpLoadingIcon 
        size={60} 
        showText={true} 
        text="Searching..." 
        className="text-center"
      />
    </div>
  );
};

export default SearchLoadingState;