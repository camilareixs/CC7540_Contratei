'use client'

import { FormEvent, useState } from 'react'
import { ArrowLeft, Check, GraduationCap } from 'lucide-react'

type Role = 'aluno' | 'profissional'

type CadastroFormProps = {
  role: Role
}

const roleContent = {
  aluno: {
    eyebrow: 'Cadastro de aluno',
    title: 'Comece sua jornada de aprendizado',
    description: 'Crie seu perfil para encontrar o profissional ideal.',
    action: 'Criar meu cadastro',
  },
  profissional: {
    eyebrow: 'Cadastro de profissional',
    title: 'Compartilhe seu conhecimento',
    description: 'Apresente seu trabalho para novos alunos.',
    action: 'Criar perfil profissional',
  },
} as const

export default function CadastroForm({ role }: CadastroFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const content = roleContent[role]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-secondary/50 px-5 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <a href="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight text-primary">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          CONTRATEI
        </a>

        <div className="mt-8 grid overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:grid-cols-[.85fr_1.15fr]">
          <div className="bg-primary p-7 text-primary-foreground sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-accent">{content.eyebrow}</p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{content.title}</h1>
            <p className="mt-4 max-w-sm leading-7 text-primary-foreground/75">{content.description}</p>
          </div>

          <div className="p-7 sm:p-10">
            {submitted ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent"><Check /></span>
                <h2 className="mt-4 text-2xl font-bold text-primary">Cadastro preenchido!</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Esta é uma demonstração visual. Nenhum dado foi enviado ou salvo.</p>
                <a href="/" className="mt-6 font-bold text-primary">Voltar para o início</a>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-primary">
                  Nome completo
                  <input required className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-accent" />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-primary">
                    E-mail
                    <input required type="email" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-accent" />
                  </label>
                  <label className="block text-sm font-semibold text-primary">
                    Telefone
                    <input type="tel" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-accent" />
                  </label>
                </div>

                {role === 'aluno' ? (
                  <label className="block text-sm font-semibold text-primary">
                    O que você quer aprender?
                    <input placeholder="Ex.: Matemática, inglês ou programação" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-accent" />
                  </label>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-primary">
                      Área de atuação
                      <input required placeholder="Ex.: Matemática" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-accent" />
                    </label>
                    <label className="block text-sm font-semibold text-primary">
                      Sobre seu trabalho
                      <textarea required rows={3} placeholder="Conte um pouco sobre sua experiência" className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-accent" />
                    </label>
                  </>
                )}

                <button className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">{content.action}</button>
              </form>
            )}

            {!submitted && (
              <a href="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                <ArrowLeft className="size-4" />
                Voltar para o início
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}