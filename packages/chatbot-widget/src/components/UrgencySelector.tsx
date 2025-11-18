import React, { useState } from 'react';
import { AlertTriangle, Clock, FileText, X } from 'lucide-react';
import type { Priority } from '../types';

interface UrgencySelectorProps {
  onSelect: (priority: Priority) => void;
  onCancel: () => void;
}

export const UrgencySelector: React.FC<UrgencySelectorProps> = ({ onSelect, onCancel }) => {
  const [selectedPriority, setSelectedPriority] = useState<Priority>(3);

  const priorities = [
    {
      level: 1 as Priority,
      label: 'URGENT / CRITIQUE',
      icon: AlertTriangle,
      color: 'red',
      description: 'Blocage total, perte de données, production down',
      responseTime: '< 15 minutes'
    },
    {
      level: 2 as Priority,
      label: 'IMPORTANT',
      icon: Clock,
      color: 'amber',
      description: 'Erreur impactante, fonction non disponible',
      responseTime: '< 1 heure'
    },
    {
      level: 3 as Priority,
      label: 'STANDARD',
      icon: FileText,
      color: 'green',
      description: 'Question d\'utilisation, information',
      responseTime: '< 4 heures'
    }
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Quelle est l'urgence ?</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {priorities.map((priority) => {
            const Icon = priority.icon;
            const isSelected = selectedPriority === priority.level;

            return (
              <button
                key={priority.level}
                onClick={() => setSelectedPriority(priority.level)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `border-${priority.color}-500 bg-${priority.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    size={24}
                    className={`flex-shrink-0 ${
                      priority.color === 'red'
                        ? 'text-red-500'
                        : priority.color === 'amber'
                        ? 'text-amber-500'
                        : 'text-green-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{priority.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{priority.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ⏱️ Temps de réponse: {priority.responseTime}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSelect(selectedPriority)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Créer le ticket
          </button>
        </div>
      </div>
    </div>
  );
};
