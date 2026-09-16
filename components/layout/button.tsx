import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  href?: string
  secondary?: boolean
  onClick?: () => void
}

export default function Button({
  children,
  href,
  secondary = false,
  onClick,
}: ButtonProps) {
  const className = `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
    secondary
      ? 'border border-border bg-background text-primary hover:bg-secondary'
      : 'bg-primary text-primary-foreground hover:bg-primary/90'
  }`

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}
