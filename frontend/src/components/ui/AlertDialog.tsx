import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
}) => {
  const icons = {
    info: <Info className="h-6 w-6 text-blue-500" />,
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    warning: <AlertCircle className="h-6 w-6 text-yellow-500" />,
    error: <XCircle className="h-6 w-6 text-red-500" />,
  };

  const colors = {
    info: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="max-w-md"
    >
      <div className={`rounded-lg border-2 ${colors[type]} p-6`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            {icons[type]}
          </div>
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            <p className="text-gray-700 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className={`${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' :
              type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              type === 'success' ? 'bg-green-600 hover:bg-green-700' :
              'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

