import React from 'react';
import { cn } from '@/lib/utils';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'lead'
  | 'muted'
  | 'success'
  | 'warning'
  | 'error';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  className?: string;
  children: React.ReactNode;
  as?: keyof HTMLElementTagNameMap; // ✅ Restrict to HTML elements only
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Typography({
  variant = 'p',
  className = '',
  children,
  as: Component = 'p',
  weight = 'normal',
  ...props
}: TypographyProps) {
  const baseStyles = 'leading-relaxed tracking-wide';
  
  const weightStyles = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const variantStyles = {
    h1: 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white',
    h2: 'text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100',
    h3: 'text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200',
    h4: 'text-lg md:text-xl font-medium text-gray-700 dark:text-gray-200',
    p: 'text-base text-gray-600 dark:text-gray-300',
    lead: 'text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium',
    muted: 'text-sm text-gray-500 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  };

  const Comp = Component as keyof JSX.IntrinsicElements;

  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant],
        weightStyles[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// ✅ Export ready-made variants for convenience
export const H1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const H4 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h4" {...props} />
);

export const P = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="p" {...props} />
);

export const Lead = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="lead" {...props} />
);

export const Muted = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="muted" {...props} />
);

export const SuccessText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="success" {...props} />
);

export const WarningText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="warning" {...props} />
);

export const ErrorText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="error" {...props} />
);
