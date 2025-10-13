/**
 * Centralized messaging utilities
 * Provides consistent toast and dialog APIs
 */

import { toast as sonnerToast } from 'sonner';

// Re-export Sonner's toast for backwards compatibility
export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },

  error: (message: string) => {
    sonnerToast.error(message);
  },

  warning: (message: string) => {
    sonnerToast.warning(message);
  },

  info: (message: string) => {
    sonnerToast.info(message);
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

// Dialog state management
interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  variant?: 'default' | 'danger' | 'warning';
}

let dialogStateSubscribers: Array<(state: DialogState | null) => void> = [];
let currentDialogState: DialogState | null = null;

export const dialog = {
  /**
   * Show a confirmation dialog
   */
  confirm: (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger' | 'warning';
  }) => {
    currentDialogState = {
      isOpen: true,
      ...options,
    };
    notifySubscribers();
  },

  /**
   * Show an alert dialog
   */
  alert: (options: {
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
  }) => {
    // Use toast for simple alerts
    const { message, variant = 'info' } = options;
    if (variant === 'success') toast.success(message);
    else if (variant === 'error') toast.error(message);
    else if (variant === 'warning') toast.warning(message);
    else toast.info(message);
  },

  /**
   * Close the current dialog
   */
  close: () => {
    currentDialogState = null;
    notifySubscribers();
  },

  /**
   * Subscribe to dialog state changes
   */
  subscribe: (callback: (state: DialogState | null) => void) => {
    dialogStateSubscribers.push(callback);
    return () => {
      dialogStateSubscribers = dialogStateSubscribers.filter(cb => cb !== callback);
    };
  },

  /**
   * Get current dialog state
   */
  getState: () => currentDialogState,
};

function notifySubscribers() {
  dialogStateSubscribers.forEach(callback => callback(currentDialogState));
}

// Utility functions for common patterns
export const messaging = {
  /**
   * Show success message
   */
  success: (message: string) => {
    toast.success(message);
  },

  /**
   * Show error message
   */
  error: (message: string) => {
    toast.error(message);
  },

  /**
   * Confirm delete action
   */
  confirmDelete: (itemName: string, onConfirm: () => void) => {
    dialog.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      onConfirm,
      variant: 'danger',
    });
  },

  /**
   * Confirm action with custom message
   */
  confirmAction: (title: string, message: string, onConfirm: () => void) => {
    dialog.confirm({
      title,
      message,
      onConfirm,
      variant: 'default',
    });
  },
};
