import React from 'react';
import { openTrainingResource, getTrainingResource } from '../lib/training';

interface TrainingButtonProps {
  /**
   * The tool/module name for which training is available
   */
  toolName: string;
  /**
   * URL to the training documentation or video (optional, overrides default)
   */
  trainingUrl?: string;
  /**
   * Type of resource to open (guide or video)
   * @default 'guide'
   */
  resourceType?: 'guide' | 'video';
  /**
   * User ID for analytics tracking
   */
  userId?: string;
  /**
   * Source page for analytics tracking
   */
  sourcePage?: string;
  /**
   * Size variant of the button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Position variant
   * @default 'floating'
   */
  variant?: 'floating' | 'inline';
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Custom onClick handler (overrides default behavior)
   */
  onClick?: () => void;
}

/**
 * TrainingButton - A consistent button component for accessing training materials
 *
 * This component provides users with easy access to training documentation,
 * videos, and guides for various tools and modules within the RT-Technologie platform.
 *
 * @example
 * // Floating button (fixed position)
 * <TrainingButton toolName="Palettes" trainingUrl="/docs/palettes-guide.pdf" />
 *
 * @example
 * // Inline button
 * <TrainingButton
 *   toolName="E-CMR"
 *   variant="inline"
 *   size="small"
 * />
 */
export function TrainingButton({
  toolName,
  trainingUrl,
  resourceType = 'guide',
  userId,
  sourcePage,
  size = 'medium',
  variant = 'floating',
  className = '',
  onClick
}: TrainingButtonProps) {
  const trainingResource = getTrainingResource(toolName);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (trainingUrl) {
      // URL personnalisée fournie
      window.open(trainingUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Utiliser le service de formation centralisé
      openTrainingResource(toolName, resourceType, userId, sourcePage);
    }
  };

  // Tooltip avec info sur la formation
  const tooltipText = trainingResource
    ? `Formation : ${toolName} (${trainingResource.estimatedDuration} min - Niveau ${trainingResource.level})`
    : `Formation : ${toolName}`;

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  const iconSizes = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 ${sizeClasses[size]} ${className}`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
        title={tooltipText}
      >
        <span style={{ fontSize: iconSizes[size] }}>🎓</span>
        <span>Formation</span>
      </button>
    );
  }

  // Inline variant
  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      title={tooltipText}
    >
      <span style={{ fontSize: iconSizes[size] }}>🎓</span>
      <span>Formation {toolName}</span>
    </button>
  );
}

export default TrainingButton;
