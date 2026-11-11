import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
export function PageTitle({eyebrow,title,children}:{eyebrow:string;title:string;children?:ReactNode}){return <div className="border-b border-border pb-8 pt-10 md:pt-14"><p className="eyebrow text-berry">{eyebrow}</p><h1 className="mt-3 text-4xl font-semibold md:text-5xl">{title}</h1>{children&&<div className="mt-4 max-w-2xl text-muted-foreground">{children}</div>}</div>;}
export function ContentError(){const router=useRouter();return <main className="container-site py-16"><h1 className="text-3xl">This page couldn't load</h1><Button className="mt-5" onClick={()=>router.invalidate()}>Try again</Button></main>;}
export function ContentNotFound(){return <main className="container-site py-16">Content not found.</main>;}
