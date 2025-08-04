import React, { useEffect, useCallback } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileKeyboardProps {
  onKeyboardShow?: (height: number) => void;
  onKeyboardHide?: () => void;
  adjustViewport?: boolean;
}

const MobileKeyboard: React.FC<MobileKeyboardProps> = ({
  onKeyboardShow,
  onKeyboardHide,
  adjustViewport = true
}) => {
  const isMobile = useIsMobile();

  const handleKeyboardShow = useCallback((info: any) => {
    console.log('Keyboard shown, height:', info.keyboardHeight);
    
    if (adjustViewport) {
      // Adjust the viewport to account for the keyboard
      document.documentElement.style.setProperty(
        '--keyboard-height', 
        `${info.keyboardHeight}px`
      );
      
      // Add CSS class for keyboard-aware styling
      document.body.classList.add('keyboard-visible');
    }
    
    if (onKeyboardShow) {
      onKeyboardShow(info.keyboardHeight);
    }
  }, [adjustViewport, onKeyboardShow]);

  const handleKeyboardHide = useCallback(() => {
    console.log('Keyboard hidden');
    
    if (adjustViewport) {
      // Reset viewport
      document.documentElement.style.removeProperty('--keyboard-height');
      document.body.classList.remove('keyboard-visible');
    }
    
    if (onKeyboardHide) {
      onKeyboardHide();
    }
  }, [adjustViewport, onKeyboardHide]);

  useEffect(() => {
    if (!isMobile || !Capacitor.isNativePlatform()) {
      return;
    }

    let keyboardShowListener: any;
    let keyboardHideListener: any;

    // Add keyboard event listeners
    const initListeners = async () => {
      keyboardShowListener = await Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
      keyboardHideListener = await Keyboard.addListener('keyboardWillHide', handleKeyboardHide);
    };

    initListeners();

    // Add CSS for keyboard adjustments
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 767px) {
        .keyboard-visible {
          padding-bottom: var(--keyboard-height, 0px) !important;
        }
        
        .keyboard-aware-input {
          transition: transform 0.3s ease;
        }
        
        .keyboard-visible .keyboard-aware-input:focus {
          transform: translateY(calc(-1 * var(--keyboard-height, 0px) / 2));
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (keyboardShowListener) {
        keyboardShowListener.remove();
      }
      if (keyboardHideListener) {
        keyboardHideListener.remove();
      }
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
      
      // Clean up any remaining styles
      document.documentElement.style.removeProperty('--keyboard-height');
      document.body.classList.remove('keyboard-visible');
    };
  }, [isMobile, handleKeyboardShow, handleKeyboardHide]);

  // This component doesn't render anything visible
  return null;
};

export default MobileKeyboard;