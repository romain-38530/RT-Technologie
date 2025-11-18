import React from 'react';

interface StatusIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, className = '' }) => {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } ${className}`}
      title={isConnected ? 'En ligne' : 'Hors ligne'}
    />
  );
};
