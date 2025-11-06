'use client';

import React from 'react';

export const ALL_CATEGORIES: string[] = [
  'Encanamento',
  'Eletricidade',
  'Pintura',
  'Limpeza',
  'Jardinagem',
  'Reformas',
  'Montagem',
  'Transporte',
  'Tecnologia',
  'Consultoria'
];

interface CategorySelectorProps {
  multiple?: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabledOptions?: string[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ multiple = false, value, onChange, disabledOptions = [] }) => {
  const selected = React.useMemo<string[]>(() => Array.isArray(value) ? value : [value].filter(Boolean), [value]);

  const toggleValue = (cat: string) => {
    if (multiple) {
      if (selected.includes(cat)) {
        onChange(selected.filter(c => c !== cat));
      } else {
        onChange([...selected, cat]);
      }
    } else {
      onChange(cat);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {ALL_CATEGORIES.map(cat => {
        const isSelected = selected.includes(cat);
        const isDisabled = disabledOptions.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => !isDisabled && toggleValue(cat)}
            disabled={isDisabled}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};


