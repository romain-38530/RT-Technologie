import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { SuggestedAction } from '../types';

interface QuickActionsProps {
  actions: SuggestedAction[];
  onActionClick: (action: SuggestedAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionClick }) => {
  if (actions.length === 0) return null;

  return (
    <div className="border-t bg-gray-50 p-3">
      <p className="text-xs text-gray-600 mb-2 font-semibold">Actions suggérées:</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onActionClick(action)}
            className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <span>{action.label}</span>
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </div>
  );
};
