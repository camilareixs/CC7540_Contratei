'use client'

import { Search, CalendarDays, UserRound, ArrowRight } from 'lucide-react'
import Button from '@/components/layout/button'
import { pros } from '@/components/aluno/dados'
import Info from '@/components/aluno/info'
import SectionTitle from '@/components/aluno/section-title'
import ProCard from '@/components/aluno/profissional-card'

export default function StudentHome(){return <><div className="rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10"><p className="text-sm font-bold uppercase tracking-widest text-accent">Área do aluno</p><h1 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-5xl">Encontre o profissional ideal para você.</h1><div className="mt-7 flex flex-col gap-3 rounded-2xl bg-background p-2 sm:flex-row"><div className="flex flex-1 items-center gap-3 px-3"><Search className="text-muted-foreground"/><input className="w-full bg-transparent py-3 text-foreground outline-none" placeholder="O que você está procurando?"/></div><Button href="/aluno/buscar">Buscar profissionais</Button></div></div><div className="mt-8 grid gap-5 md:grid-cols-3"><Info icon={Search} title="Buscar profissionais" text="Encontre especialistas por área, palavra-chave e localização." href="/aluno/buscar"/><Info icon={CalendarDays} title="Meus agendamentos" text="Acompanhe suas próximas aulas e seu histórico." href="/aluno/agendamentos"/><Info icon={UserRound} title="Meu perfil" text="Mantenha seus dados sempre atualizados." href="/aluno/perfil"/></div><section className="mt-12"><SectionTitle title="Profissionais em destaque" href="/aluno/buscar"/><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{pros.map(p=><ProCard key={p.id} p={p}/>)}</div></section></>}
