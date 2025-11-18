import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current border-t-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      primary: 'text-blue-600',
      white: 'text-white',
      gray: 'text-gray-600',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  fullScreen?: boolean;
  text?: string;
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, fullScreen, text, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        className={cn(
          'inline-flex flex-col items-center justify-center gap-2',
          fullScreen && 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50',
          className
        )}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))} />
        {text && <p className="text-sm text-gray-600">{text}</p>}
      </div>
    );

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { spinnerVariants };
