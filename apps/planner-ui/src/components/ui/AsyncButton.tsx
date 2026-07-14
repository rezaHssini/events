import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

type AsyncButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  loadingLabel?: ReactNode
  variant?: 'primary' | 'glass' | 'apple' | 'link'
  spinnerClassName?: string
}

export function AsyncButton({
  loading = false,
  loadingLabel,
  variant = 'primary',
  className = '',
  spinnerClassName = '',
  children,
  disabled,
  ...props
}: AsyncButtonProps) {
  const variants = {
    primary: 'ios-button',
    glass: 'rounded-[14px] liquid-glass-subtle font-semibold',
    apple: 'flex items-center justify-center gap-2 rounded-[14px] bg-white font-semibold text-black',
    link: 'font-medium text-[#0a84ff]',
  }

  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={`${variants[variant]} ${className} ${loading ? 'opacity-90' : ''}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" className={spinnerClassName} />
          {loadingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
