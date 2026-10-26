const ZONA = 'America/Mexico_City';

/** Fecha de hoy en la CDMX con formato AAAA-MM-DD (igual que espera el API). */
export function hoyCdmx(): string {
  // El formato en-CA produce exactamente AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

/** Suma (o resta) días a una fecha AAAA-MM-DD. */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`); // mediodía UTC: sin sorpresas por zona horaria
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
