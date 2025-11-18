import * as React from 'react';

export const EmptyOrders: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="#F3F4F6" />

      {/* Empty box */}
      <rect x="60" y="70" width="80" height="60" rx="4" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="60" y1="90" x2="140" y2="90" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="100" y1="70" x2="100" y2="90" stroke="#9CA3AF" strokeWidth="2" />

      {/* Floating elements */}
      <circle cx="40" cy="60" r="6" fill="#3B82F6" opacity="0.3" />
      <circle cx="160" cy="70" r="4" fill="#10B981" opacity="0.3" />
      <circle cx="50" cy="140" r="5" fill="#F59E0B" opacity="0.3" />
      <circle cx="150" cy="130" r="7" fill="#EF4444" opacity="0.3" />

      {/* Text indicator */}
      <text x="100" y="160" textAnchor="middle" fontSize="12" fill="#6B7280" fontFamily="Arial">
        Aucune commande
      </text>
    </svg>
  );
};

export default EmptyOrders;
