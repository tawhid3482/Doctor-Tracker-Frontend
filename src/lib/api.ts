const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const authRoutesWithoutRefresh = new Set(['/auth/login', '/auth/refresh', '/auth/logout']);
let refreshRequest: Promise<boolean> | null = null;

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${apiBase}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(response => response.ok)
      .catch(() => false)
      .finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${apiBase}${path}`, { ...init, credentials: 'include', headers });
  if (response.status === 401 && retry && !authRoutesWithoutRefresh.has(path.split('?')[0])) {
    if (await refreshSession()) return api<T>(path, init, false);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(result.message || 'Request failed', response.status);
  return result as T;
}

export type Envelope<T> = { success: true; message: string; data: T; meta?: { page: number; limit: number; total: number; totalPages: number } };
export type Admin = { id: string; name: string; email: string; role: string };
export type Doctor = { id: string; name: string; specialization: string; hospital: string; phone: string; email: string; createdAt: string; _count?: { patients: number } };
export type Patient = { id: string; name: string; age: number | null; gender: 'FEMALE'|'MALE'|'OTHER'; phone: string; email: string|null; address?: string; medicalCondition: string; doctorId: string; doctor: { id:string; name:string; specialization:string }; createdAt: string };
export type Overview = { totalDoctors:number; totalPatients:number; newDoctors:number; newPatients:number; recentDoctors:Doctor[]; recentPatients:Patient[]; patientsPerDoctor:{name:string;patients:number}[]; conditions:{name:string;value:number}[] };
