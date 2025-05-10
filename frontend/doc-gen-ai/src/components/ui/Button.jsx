import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          'btn',
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'btn-outline': variant === 'outline',
            'px-2.5 py-1.5 text-sm': size === 'sm',
            'px-4 py-2': size === 'default',
            'px-6 py-3': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;