import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merges conditional class names (clsx) and resolves conflicting Tailwind
// utility classes (twMerge) — e.g. cn("p-2", condition && "p-4") correctly
// keeps only "p-4" instead of leaving both in the className string.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
