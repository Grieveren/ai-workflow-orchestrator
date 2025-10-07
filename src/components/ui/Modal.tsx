import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Input';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel'
}: ModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      setValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={4}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 Press ⌘+Enter to submit
          </p>
        </div>

        <div className="flex gap-2 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleClose} variant="secondary">
            {cancelLabel}
          </Button>
          <Button onClick={handleSubmit} variant="primary" disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
