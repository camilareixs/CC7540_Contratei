'use client'

import { useState } from 'react'
import {
  CalendarDays,
  Menu,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import Logo from '@/components/layout/logo'

type Role = 'aluno' | 'profissional'

type HeaderProps = {
  role: Role
}

export default function Header({ role }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const links =
    role === 'aluno'
      ? [
          { label: 'Início', href: '/aluno' },
          {
            label: 'Buscar profissionais',
            href: '/aluno/buscar',
            icon: Search,
          },
          {
            label: 'Meus agendamentos',
            href: '/aluno/agendamentos',
            icon: CalendarDays,
          },
          {
            label: 'Meu perfil',
            href: '/aluno/perfil',
            icon: UserRound,
          },
        ]
      : [
          { label: 'Início', href: '/profissional' },
          {
            label: 'Meu perfil',
            href: '/profissional/perfil',
            icon: UserRound,
          },
          {
            label: 'Meus serviços',
            href: '/profissional/servicos',
            icon: Users,
          },
          {
            label: 'Minha agenda',
            href: '/profissional/agenda',
            icon: CalendarDays,
          },
          {
            label: 'Meus agendamentos',
            href: '/profissional/agendamentos',
            icon: CalendarDays,
          },
        ]

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const Icon = link.icon

            return (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              >
                {Icon && <Icon className="size-4" />}
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden text-sm font-semibold text-primary md:block">
          Olá, {role === 'aluno' ? 'Lucas' : 'Rafael'}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 md:hidden"
          aria-label="Abrir menu"
        >
          {menuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {links.map((link) => {
              const Icon = link.icon

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary"
                >
                  {Icon && <Icon className="size-4" />}
                  {link.label}
                </a>
              )
            })}

            <div className="px-3 py-2 text-sm font-semibold text-primary">
              Olá, {role === 'aluno' ? 'Lucas' : 'Rafael'}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
