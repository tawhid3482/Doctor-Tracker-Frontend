'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, MapPin, Phone, Plus, Stethoscope, Trash2, UsersRound } from 'lucide-react';
import { api, Doctor, Envelope, Patient } from '@/lib/api';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Pager } from '@/components/doctor-management';
import { Shell } from '@/components/shell';

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const doctor = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => (await api<Envelope<Doctor>>(`/doctors/${id}`)).data,
  });
  const patients = useQuery({
    queryKey: ['doctor-patients', id, page],
    queryFn: async () => api<Envelope<Patient[]>>(`/doctors/${id}/patients?page=${page}&limit=10`),
  });

  useEffect(() => {
    if ([doctor.error, patients.error].some(error => error && 'status' in error && error.status === 401)) router.replace('/login');
  }, [doctor.error, patients.error, router]);

  async function deletePatient() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api(`/patients/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['doctor-patients', id] }),
        queryClient.invalidateQueries({ queryKey: ['doctor', id] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['overview'] }),
      ]);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this patient');
    } finally {
      setDeleting(false);
    }
  }

  return <Shell title="Doctor profile">
    <Link href="/doctors" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand"><ArrowLeft size={16}/> Back to doctors</Link>
    {doctor.isLoading ? <div className="h-48 animate-pulse rounded-xl bg-white"/> : doctor.error ? <div className="rounded-xl bg-white p-8 text-center text-sm text-red-700">{(doctor.error as Error).message}</div> : doctor.data && <>
      <section className="rounded-xl border border-line bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-brand"><Stethoscope size={25}/></span><div><h2 className="text-2xl font-semibold">{doctor.data.name}</h2><p className="mt-1 text-sm text-brand">{doctor.data.specialization}</p></div></div>
          <Link href={`/patients?doctor=${id}`} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/> Add patient</Link>
        </div>
        <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3"><Info icon={MapPin} label="Hospital" value={doctor.data.hospital}/><Info icon={Phone} label="Phone" value={doctor.data.phone}/><Info icon={Mail} label="Email" value={doctor.data.email}/></div>
      </section>

      <section className="mt-5 rounded-xl border border-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line p-5"><div><h3 className="font-semibold">Assigned patients</h3><p className="mt-1 text-sm text-muted">Manage patients currently assigned to this doctor.</p></div><span className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-brand"><UsersRound size={14}/>{doctor.data._count?.patients ?? 0} patients</span></div>
        {patients.isLoading ? <div className="p-6 text-sm text-muted">Loading patients…</div> : patients.error ? <div className="p-6 text-sm text-red-700">{(patients.error as Error).message}</div> : patients.data?.data.length ? <>
          <div className="divide-y divide-line">{patients.data.data.map(patient => <div key={patient.id} className="flex flex-wrap items-center gap-3 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-600">{patient.name.slice(0, 1)}</span><div className="min-w-0 flex-1"><b className="block text-sm">{patient.name}</b><span className="text-xs text-muted">{patient.medicalCondition}</span></div><span className="text-xs text-muted">{patient.gender.toLowerCase()} {patient.age ? `· ${patient.age} years` : ''}</span><span className="text-xs text-slate-500">{patient.phone}</span><button type="button" title={`Delete ${patient.name}`} onClick={() => { setDeleteError(''); setDeleteTarget(patient); }} className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div>)}</div>
          <Pager page={patients.data.meta?.page ?? 1} pages={patients.data.meta?.totalPages ?? 0} total={patients.data.meta?.total ?? 0} onChange={setPage}/>
        </> : <div className="p-12 text-center text-sm text-muted">No patients are assigned yet.</div>}
      </section>
    </>}
    {deleteTarget && <ConfirmDialog title="Delete patient record?" description={`The patient record for ${deleteTarget.name} will be permanently removed.`} error={deleteError} busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={() => void deletePatient()}/>}
  </Shell>;
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="flex items-start gap-3"><Icon size={17} className="mt-0.5 text-muted"/><div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div></div>;
}
