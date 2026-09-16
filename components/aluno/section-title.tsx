'use client'

import { ArrowRight, MapPin } from 'lucide-react'

export default function SectionTitle({title,href}:{title:string;href:string}){return <div className="flex items-center justify-between"><h2 className="text-2xl font-extrabold text-primary">{title}</h2><a href={href} className="text-sm font-bold text-primary">Ver todos <ArrowRight className="inline size-4"/></a></div>}
