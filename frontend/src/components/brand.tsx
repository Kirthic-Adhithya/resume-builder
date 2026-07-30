import { FileText } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Brand({
  className,
  size = 'md',
  showText = true,
}: {
  className?: string
  size?: 'md' | 'lg'
  showText?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-md bg-primary text-primary-foreground',
          size === 'lg' ? 'size-9' : 'size-6',
        )}
        aria-hidden="true"
      >
        <FileText className={size === 'lg' ? 'size-5' : 'size-3.5'} strokeWidth={2.25} />
      </span>
      {showText && (
        <span
          className={cn('font-semibold tracking-tight', size === 'lg' ? 'text-xl' : 'text-[15px]')}
        >
          Resume<span className="text-primary">Builder</span>
        </span>
      )}
    </span>
  )
}
