'use client'

import { ShieldCheck, Users } from 'lucide-react'

import AuthForm from '@/components/auth-form'
import Shell from '@/components/layout/shell'
import Logo from '@/components/layout/logo'
import Button from '@/components/layout/button'
import StudentHome from '@/components/aluno/home'
import ProfissionalDetalhe from '@/components/aluno/profissional-detalhe'
import PerfilProfissional from '@/components/profissional/perfil'

function Landing() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5 py-12 text-primary-foreground">
      <div className="w-full max-w-2xl text-center">
        <Logo inverse />

        <div className="mx-auto mt-12 max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Marketplace de educação
          </p>

          <h1 className="mt-5 text-balance text-5xl font-extrabold leading-tight sm:text-7xl">
            Conectando alunos e profissionais da educação.
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-primary-foreground/75">
            Encontre quem pode transformar sua próxima conquista em realidade.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/login">Entrar</Button>
            <Button href="/cadastro" secondary>
              Criar conta
            </Button>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/60">
          <span className="flex items-center gap-2">
            <Users className="size-4" />
            Profissionais verificados
          </span>

          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Experiência segura
          </span>
        </div>
      </div>
    </main>
  )
}

export default function AppShell({ path }: { path: string }) {
  if (path === '/login') {
    return <AuthForm mode="login" />
  }

  if (path === '/cadastro') {
    return <AuthForm mode="cadastro" />
  }

  if (path.startsWith('/aluno/profissional/')) {
    return (
      <Shell role="aluno">
        <ProfissionalDetalhe />
      </Shell>
    )
  }

  if (path === '/aluno') {
    return (
      <Shell role="aluno">
        <StudentHome />
      </Shell>
    )
  }

  if (path === '/profissional/perfil') {
    return (
      <Shell role="profissional">
        <PerfilProfissional />
      </Shell>
    )
  }

  return <Landing />
}
