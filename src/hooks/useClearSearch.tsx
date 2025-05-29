
import { useSearchParams } from "react-router-dom";

export const useClearSearch = () => {
  const [, setSearchParams] = useSearchParams();

  const clearSearch = () => {
    // Clear all search parameters while staying on the same page
    setSearchParams({});
    
    // Clear the form fields by dispatching events to trigger form reset
    const formFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'];
    formFields.forEach(fieldName => {
      const input = document.querySelector(`input[placeholder="${fieldName === 'firstName' ? 'First Name' : fieldName === 'lastName' ? 'Last Name' : fieldName === 'phone' ? 'Phone Number' : fieldName === 'address' ? 'Address' : fieldName === 'city' ? 'City' : fieldName === 'zipCode' ? 'ZIP Code' : fieldName}"]`) as HTMLInputElement;
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Clear the state dropdown
    const stateSelect = document.querySelector('[aria-label="State"]') as HTMLElement;
    if (stateSelect) {
      stateSelect.click();
      setTimeout(() => {
        const placeholderOption = document.querySelector('[data-value=""]');
        if (placeholderOption) {
          (placeholderOption as HTMLElement).click();
        }
      }, 100);
    }
  };

  return { clearSearch };
};
