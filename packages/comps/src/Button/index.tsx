import { cn } from 'utils'
import { memo } from 'react'

export const Button = memo<ButtonProps>((props) => {
  const {
    variant = 'default',
    size = 'md',
    disabled,
    className,
    children,
    ...rest
  } = props

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

const variantStyles = {
  default: 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
  ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
  danger: 'bg-red-500 text-white hover:bg-red-600',
} as const

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
} as const

export type ButtonProps = {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
} & React.ButtonHTMLAttributes<HTMLButtonElement>
