import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'group/btn relative inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-medium tracking-tight transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'active:scale-[0.985]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variant === 'primary' && [
          'bg-forest text-cream shadow-[0_1px_0_rgba(212,165,116,0.5)_inset,0_8px_24px_-12px_rgba(15,61,46,0.6)]',
          'hover:bg-forest/95 hover:shadow-[0_1px_0_rgba(212,165,116,0.7)_inset,0_12px_32px_-12px_rgba(15,61,46,0.7)]',
        ],
        variant === 'outline' && [
          'border border-forest/20 bg-transparent text-forest',
          'hover:border-forest/40 hover:bg-forest/[0.03]',
        ],
        variant === 'ghost' && 'text-forest hover:bg-forest/[0.04]',
        className,
      )}
      {...props}
    />
  );
});
