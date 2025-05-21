
import { useState } from "react";

export const useVerificationTimer = (initialSeconds = 60) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(initialSeconds);
  
  const startTimer = () => {
    setIsDisabled(true);
    setTimer(initialSeconds);
    
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(intervalId);
          setIsDisabled(false);
          return 0;
        }
      });
    }, 1000);
    
    return intervalId;
  };
  
  return {
    isDisabled,
    isResendDisabled: isDisabled, // Added for backward compatibility
    timer,
    startTimer
  };
};
