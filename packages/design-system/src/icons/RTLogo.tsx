import * as React from 'react';

export interface RTLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'icon';
}

export const RTLogo: React.FC<RTLogoProps> = ({ variant = 'full', ...props }) => {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect width="64" height="64" rx="12" fill="#3b82f6" />
        <path
          d="M16 20h12c4.418 0 8 3.582 8 8 0 2.761-1.402 5.197-3.531 6.641L38 44h-7.5l-5.5-9H22v9h-6V20zm6 6v6h6c1.657 0 3-1.343 3-3s-1.343-3-3-3h-6z"
          fill="white"
        />
        <path
          d="M40 26h-4v-6h16v6h-4v18h-8V26z"
          fill="white"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Logo icon */}
      <rect width="64" height="64" rx="12" fill="#3b82f6" />
      <path
        d="M16 20h12c4.418 0 8 3.582 8 8 0 2.761-1.402 5.197-3.531 6.641L38 44h-7.5l-5.5-9H22v9h-6V20zm6 6v6h6c1.657 0 3-1.343 3-3s-1.343-3-3-3h-6z"
        fill="white"
      />
      <path
        d="M40 26h-4v-6h16v6h-4v18h-8V26z"
        fill="white"
      />

      {/* Text "Technologie" */}
      <text
        x="72"
        y="40"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#1f2937"
      >
        Technologie
      </text>
    </svg>
  );
};

export default RTLogo;
