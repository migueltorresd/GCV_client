import { apiClient } from '../../shared/api-client';
import type { AprobarMasivoResult } from '../../shared/types';

// POST /novedades/:id/aprobar — PENDIENTE → APROBADA (rol SUPERVISOR).
export async function aprobar(id: number): Promise<void> {
  await apiClient.post(`/novedades/${id}/aprobar`);
}

// POST /novedades/:id/rechazar — PENDIENTE → RECHAZADA con motivo (rol SUPERVISOR).
export async function rechazar(id: number, motivo: string): Promise<void> {
  await apiClient.post(`/novedades/${id}/rechazar`, { motivo });
}

// POST /novedades/aprobar-masivo — filter-and-skip; devuelve { procesados, ignorados }.
export async function aprobarMasivo(ids: number[]): Promise<AprobarMasivoResult> {
  const { data } = await apiClient.post<AprobarMasivoResult>('/novedades/aprobar-masivo', { ids });
  return data;
}
