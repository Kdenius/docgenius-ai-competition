import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function for conditionally joining class names together
 * Combines clsx and tailwind-merge for more efficient class name composition
 * @param  {...any} inputs - Class names, objects, or arrays of class names
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}