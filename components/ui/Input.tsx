import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-xl border border-forest/15 bg-white/70 px-4 py-3 text-sm text-forest shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] placeholder:text-forest/35 transition-colors focus:border-forest/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-300/40';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(base, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 3, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(base, 'resize-y leading-relaxed', className)}
        {...props}
      />
    );
  },
);
