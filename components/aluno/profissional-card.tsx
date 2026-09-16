'use client'

import { ArrowRight, MapPin } from 'lucide-react'

export default function ProCard({p}:{p:any}){return <article className="overflow-hidden rounded-2xl border border-border bg-card"><img src={p.photo} alt={`Foto de ${p.name}`} className="aspect-[4/3] w-full object-cover"/><div className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-accent">{p.subject}</p><h3 className="mt-1 font-bold text-primary">{p.name}</h3><p className="mt-2 flex gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5"/>{p.city}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><b className="text-primary">R$ {p.price}<span className="text-xs font-normal">/h</span></b><a href={`/aluno/profissional/${p.id}`} className="text-sm font-bold text-primary">Ver perfil</a></div></div></article>}
