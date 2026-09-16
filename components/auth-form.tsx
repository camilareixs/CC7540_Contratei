'use client'

import { FormEvent, useState } from 'react'
import { Check, GraduationCap } from 'lucide-react'

type Mode = 'login' | 'cadastro'
type Role = 'aluno' | 'profissional'

export default function AuthForm({ mode }: { mode: Mode }) {
  const [role, setRole] = useState<Role>('aluno')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'cadastro' && password !== confirm) {
      setError('As senhas não conferem.')
      return
    }

    if (mode === 'login') {
      window.location.assign(role === 'aluno' ? '/aluno' : '/profissional/perfil')
      return
    }

    setMessage(
      'Cadastro visualizado. A conexão com o banco de dados está desativada nesta versão.',
    )
  }

  return <main className="flex min-h-screen items-center justify-center bg-secondary/50 px-5 py-10"><div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-9"><a href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-primary"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-5" /></span>CONTRATEI</a><div className="mt-8"><p className="text-sm font-bold uppercase tracking-widest text-accent">Sua jornada começa aqui</p><h1 className="mt-3 text-3xl font-extrabold text-primary">{mode === 'login' ? 'Bem-vindo ao CONTRATEI' : 'Crie sua conta'}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === 'login' ? 'Entre para encontrar profissionais e acompanhar suas aulas.' : 'Encontre profissionais ou compartilhe seu conhecimento.'}</p></div><div className="mt-7 grid grid-cols-2 rounded-xl bg-secondary p-1"><button type="button" className={`rounded-lg py-2 text-sm font-bold ${role === 'aluno' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`} onClick={() => setRole('aluno')}>Aluno</button><button type="button" className={`rounded-lg py-2 text-sm font-bold ${role === 'profissional' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`} onClick={() => setRole('profissional')}>Profissional</button></div>{message ? <div className="py-10 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent"><Check /></span><h2 className="mt-4 text-xl font-bold text-primary">Tudo certo!</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p><a className="mt-6 inline-flex font-bold text-primary" href="/login">Ir para entrar</a></div> : <form className="mt-6 space-y-4" onSubmit={submit}>{mode === 'cadastro' && <label className="block text-sm font-semibold text-primary">Nome completo<input required value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none ring-accent focus:ring-2" /></label>}<label className="block text-sm font-semibold text-primary">E-mail<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none ring-accent focus:ring-2" /></label><label className="block text-sm font-semibold text-primary">Senha<input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none ring-accent focus:ring-2" /></label>{mode === 'cadastro' && <label className="block text-sm font-semibold text-primary">Confirmar senha<input required minLength={6} type="password" value={confirm} onChange={event => setConfirm(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none ring-accent focus:ring-2" /></label>}{error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">{mode === 'login' ? 'Entrar' : 'Criar minha conta'}</button><p className="text-center text-sm text-muted-foreground">{mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}<a className="font-bold text-primary" href={mode === 'login' ? '/cadastro' : '/login'}>{mode === 'login' ? 'Cadastre-se' : 'Entre aqui'}</a></p></form>}</div></main>
}
