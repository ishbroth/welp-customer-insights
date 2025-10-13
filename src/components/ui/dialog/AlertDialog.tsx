import React from 'react';
import { Dialog } from './Dialog';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
}) => {
  const variantConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-success-500',
      bgColor: 'bg-success-50',
      buttonColor: 'bg-success-500 hover:bg-success-600 text-white',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-error-500',
      bgColor: 'bg-error-50',
      buttonColor: 'bg-error-500 hover:bg-error-600 text-white',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-warning-500',
      bgColor: 'bg-warning-50',
      buttonColor: 'bg-warning-500 hover:bg-warning-600 text-white',
    },
    info: {
      icon: Info,
      iconColor: 'text-info-500',
      bgColor: 'bg-info-50',
      buttonColor: 'bg-info-500 hover:bg-info-600 text-white',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        {/* Message with icon */}
        <div className={`flex items-start gap-3 p-4 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-6 h-6 flex-shrink-0 ${config.iconColor}`} />
          <p className="text-gray-700 flex-1">{message}</p>
        </div>

        {/* Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${config.buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
