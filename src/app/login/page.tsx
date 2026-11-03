'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, Envelope } from '@/lib/api';

const loginSchema=z.object({email:z.string().email('Enter a valid email address'),password:z.string().min(1,'Enter your password')});
type LoginFields=z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const {register,handleSubmit,formState:{errors}}=useForm<LoginFields>({resolver:zodResolver(loginSchema)});
  async function submit(fields:LoginFields) {
    setBusy(true); setError('');
    try { await api<Envelope<unknown>>('/auth/login', { method: 'POST', body: JSON.stringify(fields) }, false); router.replace('/'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); } finally { setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#f3f7f6] p-5"><div className="w-full max-w-[430px] rounded-2xl border border-line bg-white p-8 shadow-card sm:p-10"><div className="mb-8 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white"><Activity/></span><div className="text-xl font-bold">Care<span className="text-brand">track</span></div></div><p className="text-sm font-semibold uppercase tracking-wide text-brand">Welcome back</p><h1 className="mt-2 text-2xl font-semibold">Sign in to your workspace</h1><p className="mt-2 text-sm text-muted">Manage your clinic team and patient records.</p><form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5"><label className="block text-sm font-medium">Email address<span className="relative mt-2 block"><Mail size={17} className="absolute left-3 top-3 text-muted"/><input {...register('email')} type="email" autoComplete="username" className="w-full rounded-lg border border-line py-2.5 pl-10 pr-3 outline-none focus:border-brand focus:ring-2 focus:ring-teal-100" placeholder="admin@clinic.com"/></span>{errors.email&&<span className="mt-1 block text-xs text-red-700">{errors.email.message}</span>}</label><label className="block text-sm font-medium">Password<span className="relative mt-2 block"><LockKeyhole size={17} className="absolute left-3 top-3 text-muted"/><input {...register('password')} type="password" autoComplete="current-password" className="w-full rounded-lg border border-line py-2.5 pl-10 pr-3 outline-none focus:border-brand focus:ring-2 focus:ring-teal-100" placeholder="Enter your password"/></span>{errors.password&&<span className="mt-1 block text-xs text-red-700">{errors.password.message}</span>}</label>{error&&<p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-[#0d5957] disabled:opacity-60">{busy?'Signing in…':'Sign in'}{!busy&&<ArrowRight size={17}/>}</button></form><p className="mt-7 text-center text-xs text-muted">Access is managed by your clinic administrator.</p></div></main>;
}
