import * as React from 'react';

export interface CertificateProps {
  userName: string;
  moduleName: string;
  completionDate: string;
  score: number;
}

export const Certificate: React.FC<CertificateProps> = ({
  userName,
  moduleName,
  completionDate,
  score,
}) => {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'white' }}
    >
      {/* Border decoration */}
      <rect
        x="20"
        y="20"
        width="760"
        height="560"
        rx="8"
        stroke="#F59E0B"
        strokeWidth="4"
      />
      <rect
        x="30"
        y="30"
        width="740"
        height="540"
        rx="4"
        stroke="#FCD34D"
        strokeWidth="2"
      />

      {/* Header */}
      <text
        x="400"
        y="80"
        textAnchor="middle"
        fontSize="36"
        fontWeight="bold"
        fill="#1F2937"
        fontFamily="Arial, serif"
      >
        CERTIFICAT DE FORMATION
      </text>

      {/* Logo */}
      <circle cx="400" cy="150" r="40" fill="#3B82F6" />
      <text
        x="400"
        y="160"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial"
      >
        RT
      </text>

      {/* Body */}
      <text
        x="400"
        y="230"
        textAnchor="middle"
        fontSize="18"
        fill="#6B7280"
        fontFamily="Arial"
      >
        Ce certificat atteste que
      </text>

      <text
        x="400"
        y="280"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fill="#1F2937"
        fontFamily="Arial, serif"
      >
        {userName}
      </text>

      <text
        x="400"
        y="330"
        textAnchor="middle"
        fontSize="18"
        fill="#6B7280"
        fontFamily="Arial"
      >
        a complété avec succès le module
      </text>

      <text
        x="400"
        y="380"
        textAnchor="middle"
        fontSize="24"
        fontWeight="600"
        fill="#3B82F6"
        fontFamily="Arial"
      >
        {moduleName}
      </text>

      {/* Score */}
      <rect
        x="340"
        y="410"
        width="120"
        height="50"
        rx="25"
        fill="#10B981"
      />
      <text
        x="400"
        y="443"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial"
      >
        Score : {score}%
      </text>

      {/* Footer */}
      <text
        x="400"
        y="510"
        textAnchor="middle"
        fontSize="16"
        fill="#6B7280"
        fontFamily="Arial"
      >
        Délivré le {completionDate}
      </text>

      <text
        x="400"
        y="540"
        textAnchor="middle"
        fontSize="14"
        fill="#9CA3AF"
        fontFamily="Arial"
      >
        RT-Technologie - Plateforme de Transport & Logistique
      </text>

      {/* Decorative elements */}
      <circle cx="100" cy="100" r="8" fill="#F59E0B" opacity="0.3" />
      <circle cx="700" cy="100" r="8" fill="#F59E0B" opacity="0.3" />
      <circle cx="100" cy="500" r="8" fill="#F59E0B" opacity="0.3" />
      <circle cx="700" cy="500" r="8" fill="#F59E0B" opacity="0.3" />

      {/* Award ribbon */}
      <path
        d="M730 480 L750 500 L730 520 L710 500 Z"
        fill="#F59E0B"
      />
      <rect x="728" y="500" width="4" height="30" fill="#F59E0B" />
      <rect x="748" y="500" width="4" height="30" fill="#F59E0B" />
    </svg>
  );
};

export default Certificate;
