'use client';

import React from 'react';
import { CategorySelector } from './CategorySelector';
import { Button } from '@/components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSelected?: string[];
  onApply: (categories: string[]) => void;
  disabledOptions?: string[];
}

export const CategoryFilterModal: React.FC<Props> = ({ isOpen, onClose, initialSelected = [], onApply, disabledOptions = [] }) => {
  const [selected, setSelected] = React.useState<string[]>(initialSelected);

  React.useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Selecionar categorias</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">✕</button>
        </div>

        <CategorySelector multiple value={selected} onChange={(v) => setSelected(v as string[])} disabledOptions={disabledOptions} />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onApply(selected); onClose(); }} className="bg-blue-600 hover:bg-blue-700">Aplicar</Button>
        </div>
      </div>
    </div>
  );
};


