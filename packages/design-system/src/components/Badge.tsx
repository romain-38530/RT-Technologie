import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning:
          'border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200',
        error:
          'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        info:
          'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        outline:
          'border-gray-300 bg-white text-gray-700',
        // Statuts de commande
        draft:
          'border-transparent bg-gray-100 text-gray-700',
        pending:
          'border-transparent bg-orange-100 text-orange-700',
        confirmed:
          'border-transparent bg-blue-100 text-blue-700',
        inProgress:
          'border-transparent bg-purple-100 text-purple-700',
        delivered:
          'border-transparent bg-green-100 text-green-700',
        cancelled:
          'border-transparent bg-red-100 text-red-700',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
      dot: {
        true: 'pl-1.5',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      dot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              variant === 'primary' && 'bg-white',
              variant === 'success' && 'bg-green-600',
              variant === 'warning' && 'bg-orange-600',
              variant === 'error' && 'bg-red-600',
              variant === 'info' && 'bg-blue-600',
              variant === 'pending' && 'bg-orange-600',
              variant === 'confirmed' && 'bg-blue-600',
              variant === 'inProgress' && 'bg-purple-600',
              variant === 'delivered' && 'bg-green-600',
              variant === 'cancelled' && 'bg-red-600'
            )}
          />
        )}
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
