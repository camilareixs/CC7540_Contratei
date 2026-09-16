import Header from '@/components/layout/header'

type Role = 'aluno' | 'profissional'

type ShellProps = {
  role: Role
  children: React.ReactNode
}

export default function Shell({ role, children }: ShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header role={role} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
