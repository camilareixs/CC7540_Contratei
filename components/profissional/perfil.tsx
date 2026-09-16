'use client'

import { UserRound } from 'lucide-react'
import Button from '@/components/layout/button'
import Field from '@/components/auth/field'

export default function PerfilProfissional() {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-widest text-accent">
        Conta
      </p>

      <h1 className="mt-2 text-3xl font-extrabold text-primary">
        Meu perfil
      </h1>

      <div className="mt-7 max-w-2xl rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
            <UserRound className="size-7" />
          </span>

          <div>
            <h2 className="font-bold text-primary">
              Rafael Lima
            </h2>

            <p className="text-sm text-muted-foreground">
              profissional@email.com
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" />
          <Field label="E-mail" type="email" />
          <Field label="Telefone" />
        </div>

        <div className="mt-6">
          <Button>Salvar alterações</Button>
        </div>
      </div>
    </>
  )
}
