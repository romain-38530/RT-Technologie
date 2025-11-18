import * as React from 'react';
import { cn } from '../lib/utils';

export interface QuickReply {
  id: string;
  label: string;
  message: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export interface QuickReplyButtonsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  replies: QuickReply[];
  onSelect?: (reply: QuickReply) => void;
  layout?: 'grid' | 'horizontal' | 'vertical';
  disabled?: boolean;
}

const QuickReplyButtons = React.forwardRef<
  HTMLDivElement,
  QuickReplyButtonsProps
>(
  (
    {
      className,
      replies,
      onSelect,
      layout = 'grid',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = (
      variant: QuickReply['variant'] = 'default'
    ) => {
      const styles = {
        default:
          'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100',
        primary:
          'bg-blue-50 border-2 border-blue-300 text-blue-900 hover:bg-blue-100 active:bg-blue-200',
        success:
          'bg-green-50 border-2 border-green-300 text-green-900 hover:bg-green-100 active:bg-green-200',
        warning:
          'bg-orange-50 border-2 border-orange-300 text-orange-900 hover:bg-orange-100 active:bg-orange-200',
        error:
          'bg-red-50 border-2 border-red-300 text-red-900 hover:bg-red-100 active:bg-red-200',
      };
      return styles[variant];
    };

    const getLayoutStyles = () => {
      switch (layout) {
        case 'horizontal':
          return 'flex gap-2 overflow-x-auto pb-2';
        case 'vertical':
          return 'flex flex-col gap-2';
        case 'grid':
        default:
          return 'grid grid-cols-2 gap-3';
      }
    };

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        <div className={getLayoutStyles()}>
          {replies.map((reply) => (
            <button
              key={reply.id}
              onClick={() => !disabled && onSelect?.(reply)}
              disabled={disabled}
              className={cn(
                'min-h-[56px] px-4 py-3 rounded-lg font-semibold text-sm transition-all touch-manipulation focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                getVariantStyles(reply.variant),
                layout === 'horizontal' && 'flex-shrink-0 min-w-[140px]',
                reply.variant === 'primary' && 'focus:ring-blue-200',
                reply.variant === 'success' && 'focus:ring-green-200',
                reply.variant === 'warning' && 'focus:ring-orange-200',
                reply.variant === 'error' && 'focus:ring-red-200',
                reply.variant === 'default' && 'focus:ring-gray-200'
              )}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                {reply.icon && (
                  <div className="flex-shrink-0">{reply.icon}</div>
                )}
                <span className="text-center leading-tight">
                  {reply.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

QuickReplyButtons.displayName = 'QuickReplyButtons';

// Réponses pré-configurées courantes
export const commonQuickReplies: QuickReply[] = [
  {
    id: 'arrived',
    label: 'Arrivé sur site',
    message: 'Je suis arrivé sur le site de chargement/livraison',
    variant: 'success',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  {
    id: 'delay-15',
    label: 'Retard 15min',
    message: 'Je serai en retard de 15 minutes environ',
    variant: 'warning',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'delay-30',
    label: 'Retard 30min',
    message: 'Je serai en retard de 30 minutes environ',
    variant: 'error',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'issue',
    label: 'Problème',
    message: 'Je rencontre un problème',
    variant: 'error',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  {
    id: 'loading',
    label: 'Chargement en cours',
    message: 'Le chargement est en cours',
    variant: 'primary',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    id: 'unloading',
    label: 'Déchargement en cours',
    message: 'Le déchargement est en cours',
    variant: 'primary',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ),
  },
  {
    id: 'completed',
    label: 'Mission terminée',
    message: 'La mission est terminée avec succès',
    variant: 'success',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'need-help',
    label: 'Besoin d\'aide',
    message: 'J\'ai besoin d\'assistance',
    variant: 'warning',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export { QuickReplyButtons };
export type { QuickReply };
