import { GraduationCap } from 'lucide-react'

export default function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      href="/"
      className={`flex items-center gap-2 font-extrabold tracking-tight ${
        inverse ? 'text-primary-foreground' : 'text-primary'
      }`}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-xl ${
          inverse
            ? 'bg-primary-foreground text-primary'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <GraduationCap className="size-5" />
      </span>

      CONTRATEI
    </a>
  )
}
