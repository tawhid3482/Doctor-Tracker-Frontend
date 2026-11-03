'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, LayoutDashboard, Stethoscope, UsersRound, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Admin, api, Envelope } from '@/lib/api';

const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: UsersRound },
];

export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const queryClient = useQueryClient(); const [open, setOpen] = useState(false); const [loggingOut, setLoggingOut] = useState(false); const [logoutError, setLogoutError] = useState('');
  const adminQuery = useQuery({ queryKey: ['current-admin'], queryFn: async () => (await api<Envelope<Admin>>('/auth/me')).data, staleTime: 5 * 60_000 });
  useEffect(() => { if (adminQuery.error && 'status' in adminQuery.error && adminQuery.error.status === 401) router.replace('/login'); }, [adminQuery.error, router]);
  async function logout() {
    setLoggingOut(true); setLogoutError('');
    try {
      await api('/auth/logout', { method: 'POST' });
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Could not sign out. Check the server connection and try again.');
    } finally {
      setLoggingOut(false);
    }
  }
  return <div className="min-h-screen md:flex">
    {open && <button className="fixed inset-0 z-20 bg-slate-950/30 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-line bg-white transition-transform md:static md:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="flex h-[76px] items-center gap-3 border-b border-line px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><Activity size={22}/></span><div><div className="font-bold tracking-tight">Care<span className="text-brand">track</span></div><div className="text-[11px] text-muted">CLINIC ADMIN</div></div><button className="ml-auto md:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
      <nav className="space-y-1 px-3 py-7">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${pathname===href?'bg-teal-50 text-brand':'text-slate-500 hover:bg-slate-50 hover:text-ink'}`}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="mt-auto border-t border-line p-4">{logoutError&&<p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{logoutError}</p>}<button disabled={loggingOut} onClick={()=>void logout()} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-500 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">{loggingOut?<LoaderCircle size={18} className="animate-spin"/>:<LogOut size={18}/>} {loggingOut?'Signing out…':'Sign out'}</button></div>
    </aside>
    <main className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-line bg-white px-5 md:px-9"><div className="flex items-center gap-3"><button className="md:hidden" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button><div><p className="text-xs text-muted">Workspace / {title}</p><h1 className="text-lg font-semibold">{title}</h1></div></div><div className="flex items-center gap-3 rounded-lg px-2 py-1.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f2f0] text-sm font-semibold text-brand">{adminQuery.data?.name.split(' ').map(part=>part[0]).slice(0,2).join('').toUpperCase()||'AD'}</span><span className="hidden text-left sm:block"><span className="block text-sm font-medium">{adminQuery.data?.name||'Administrator'}</span><span className="block text-xs text-muted">{adminQuery.data?.email||'Clinic manager'}</span></span><ChevronDown size={15} className="hidden text-muted sm:block"/></div></header><div className="mx-auto max-w-[1440px] p-5 md:p-9">{children}</div></main>
  </div>;
}
