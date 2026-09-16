'use client'

import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import Button from '@/components/layout/button'
import { pros } from '@/components/aluno/dados'

export default function ProfissionalDetalhe() {
  const professional = pros[0]

  return (
    <>
      <a
        href="/aluno/buscar"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-4" />
        Voltar para resultados
      </a>

      <div className="mt-6 grid gap-7 rounded-3xl border border-border bg-card p-6 md:grid-cols-[220px_1fr] md:p-8">
        <img
          src={professional.photo}
          alt={`Foto de ${professional.name}`}
          className="aspect-square w-full rounded-2xl object-cover"
        />

        <div>
          <p className="font-bold uppercase tracking-widest text-accent">
            Perfil do profissional
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-primary">
            {professional.name}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {professional.subject}
          </p>

          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {professional.city}
          </p>

          <p className="mt-7 max-w-2xl leading-7 text-muted-foreground">
            {professional.bio}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <strong className="text-2xl text-primary">
              R$ {professional.price}
              <span className="text-sm font-normal">/hora</span>
            </strong>

            <Button href="/aluno/agendar">
              <CalendarDays className="size-4" />
              Ver disponibilidade
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
