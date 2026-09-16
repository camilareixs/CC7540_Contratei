'use client'

import { ArrowRight, MapPin } from 'lucide-react'

export default function Info({icon:Icon,title,text,href}:{icon:any;title:string;text:string;href:string}){return <a href={href} className="rounded-2xl border border-border bg-card p-5 hover:border-primary"><span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><Icon/></span><h2 className="mt-4 font-bold text-primary">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></a>}
