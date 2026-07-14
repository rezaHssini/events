import { Loader2 } from 'lucide-react'

export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }

  return (
    <Loader2
      className={`animate-spin ${sizes[size]} ${className}`}
      aria-hidden
    />
  )
}
