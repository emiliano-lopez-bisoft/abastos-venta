/**
 * Manejo de fechas en horario de la CDMX.
 *
 * El servidor puede estar en otra zona horaria (en la nube suele ser UTC),
 * así que "el día de hoy" y los rangos de un día se calculan siempre con la
 * hora de la Ciudad de México.
 */
const ZONA = "America/Mexico_City";
const DESFASE = "-06:00";

/** Fecha de hoy en la CDMX con formato AAAA-MM-DD. */
export function hoyCdmx(): string {
  // El formato en-CA produce exactamente AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(
    new Date(),
  );
}

/** Rango [desde, hasta) que cubre el día completo en la CDMX. */
export function rangoDelDia(fecha: string): { desde: Date; hasta: Date } {
  const desde = new Date(`${fecha}T00:00:00${DESFASE}`);
  const hasta = new Date(desde.getTime() + 24 * 60 * 60 * 1000);
  return { desde, hasta };
}
