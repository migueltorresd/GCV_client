// Nombre legible de la filial para mostrarla de forma prominente en la UI.
//
// SUPUESTO (solo presentación): los emails semilla codifican la filial en el
// subdominio — carla@and.gcv.com → Andinagas, diego@ret.gcv.com → RetailVertice.
// Es un heurístico de UI, NO una fuente de verdad: el tenant real es el
// filial_id del JWT y el aislamiento se aplica en el backend. Si el backend
// algún día incluye `filial_nombre` en los claims, se reemplaza esta función
// por ese valor y nada más cambia.

export interface FilialUI {
  nombre: string;
  color: string;
}

const POR_SUBDOMINIO: Record<string, FilialUI> = {
  and: { nombre: 'Andinagas', color: 'var(--cyan)' },
  ret: { nombre: 'RetailVertice', color: 'var(--pink)' },
};

export function filialDesdeEmail(email: string, filialId: number): FilialUI {
  const subdominio = email.split('@')[1]?.split('.')[0]?.toLowerCase() ?? '';
  return POR_SUBDOMINIO[subdominio] ?? { nombre: `Filial ${filialId}`, color: 'var(--orange)' };
}
