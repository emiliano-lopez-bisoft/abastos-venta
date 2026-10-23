import { errorDeColor } from "@abastos/shared";
import type {
  ActualizarManifiestoLineaInput,
  ActualizarTrailerInput,
  CrearTrailerInput,
  EstadoTrailer,
  ManifiestoLineaInput,
  TrailerDto,
} from "@abastos/shared";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { aDecimal, aNumero } from "../../lib/dinero.js";
import { AppError } from "../../middlewares/error-handler.js";

const conManifiesto = {
  manifiesto: { orderBy: { id: "asc" } },
} satisfies Prisma.TrailerInclude;

type TrailerConManifiesto = Prisma.TrailerGetPayload<{
  include: typeof conManifiesto;
}>;

/** Cajas vendidas por línea de manifiesto (solo tickets vigentes). */
async function vendidasPorLinea(
  lineaIds: number[],
): Promise<Map<number, number>> {
  if (lineaIds.length === 0) return new Map();
  const filas = await prisma.ticketDetalle.groupBy({
    by: ["manifiestoDetalleId"],
    where: {
      manifiestoDetalleId: { in: lineaIds },
      ticket: { estado: "VIGENTE" },
    },
    _sum: { cajas: true },
  });
  return new Map(filas.map((f) => [f.manifiestoDetalleId, f._sum.cajas ?? 0]));
}

function aDto(
  t: TrailerConManifiesto,
  vendidas: Map<number, number>,
): TrailerDto {
  const manifiesto = t.manifiesto.map((l) => {
    const v = vendidas.get(l.id) ?? 0;
    return {
      id: l.id,
      producto: l.producto,
      color: l.color,
      tamano: l.tamano,
      cajas: l.cajas,
      vendidas: v,
      disponibles: l.cajas - v,
    };
  });
  const suma = (campo: "cajas" | "vendidas" | "disponibles") =>
    manifiesto.reduce((acc, l) => acc + l[campo], 0);

  return {
    id: t.id,
    placa: t.placa,
    numero: t.numero,
    invernadero: t.invernadero,
    chofer: t.chofer,
    anden: t.anden,
    costoAnden: aNumero(t.costoAnden),
    flete: aNumero(t.flete),
    descarga: aNumero(t.descarga),
    comisionPorcentaje: aNumero(t.comisionPorcentaje),
    fechaLlegada: t.fechaLlegada.toISOString(),
    estado: t.estado,
    manifiesto,
    totales: {
      cajas: suma("cajas"),
      vendidas: suma("vendidas"),
      disponibles: suma("disponibles"),
    },
  };
}

async function aDtos(trailers: TrailerConManifiesto[]): Promise<TrailerDto[]> {
  const ids = trailers.flatMap((t) => t.manifiesto.map((l) => l.id));
  const vendidas = await vendidasPorLinea(ids);
  return trailers.map((t) => aDto(t, vendidas));
}

const lineaAData = (l: ManifiestoLineaInput) => ({
  producto: l.producto,
  color: l.color || null,
  tamano: l.tamano,
  cajas: l.cajas,
});

async function buscarOFallar(id: number): Promise<TrailerConManifiesto> {
  const trailer = await prisma.trailer.findUnique({
    where: { id },
    include: conManifiesto,
  });
  if (!trailer) throw new AppError(404, `No existe el trailer ${id}`);
  return trailer;
}

// ---------- Casos de uso ----------

export async function crearTrailer(
  input: CrearTrailerInput,
): Promise<TrailerDto> {
  const {
    manifiesto,
    costoAnden,
    flete,
    descarga,
    comisionPorcentaje,
    ...datos
  } = input;
  // El create anidado guarda trailer y manifiesto en una sola transacción.
  const trailer = await prisma.trailer.create({
    data: {
      ...datos,
      costoAnden: aDecimal(costoAnden),
      flete: aDecimal(flete ?? 0),
      descarga: aDecimal(descarga ?? 0),
      comisionPorcentaje: aDecimal(comisionPorcentaje ?? 10),
      manifiesto: { create: manifiesto.map(lineaAData) },
    },
    include: conManifiesto,
  });
  return aDto(trailer, new Map());
}

export async function listarTrailers(
  estado?: EstadoTrailer,
): Promise<TrailerDto[]> {
  const trailers = await prisma.trailer.findMany({
    where: estado ? { estado } : undefined,
    include: conManifiesto,
    orderBy: { fechaLlegada: "desc" },
  });
  return aDtos(trailers);
}

export async function obtenerTrailer(id: number): Promise<TrailerDto> {
  const [dto] = await aDtos([await buscarOFallar(id)]);
  return dto!;
}

export async function actualizarTrailer(
  id: number,
  input: ActualizarTrailerInput,
): Promise<TrailerDto> {
  await buscarOFallar(id);
  const { costoAnden, flete, descarga, comisionPorcentaje, ...datos } = input;
  await prisma.trailer.update({
    where: { id },
    data: {
      ...datos,
      // Solo se actualizan los importes que vienen en la petición.
      ...(costoAnden !== undefined && { costoAnden: aDecimal(costoAnden) }),
      ...(flete !== undefined && { flete: aDecimal(flete) }),
      ...(descarga !== undefined && { descarga: aDecimal(descarga) }),
      ...(comisionPorcentaje !== undefined && {
        comisionPorcentaje: aDecimal(comisionPorcentaje),
      }),
    },
  });
  return obtenerTrailer(id);
}

export async function cambiarEstado(
  id: number,
  estado: EstadoTrailer,
): Promise<TrailerDto> {
  await buscarOFallar(id);
  await prisma.trailer.update({ where: { id }, data: { estado } });
  return obtenerTrailer(id);
}

// ---------- Correcciones al manifiesto ----------

export async function agregarLinea(
  trailerId: number,
  input: ManifiestoLineaInput,
): Promise<TrailerDto> {
  await buscarOFallar(trailerId);
  await prisma.manifiestoDetalle.create({
    data: { trailerId, ...lineaAData(input) },
  });
  return obtenerTrailer(trailerId);
}

async function lineaDelTrailer(trailerId: number, lineaId: number) {
  const linea = await prisma.manifiestoDetalle.findFirst({
    where: { id: lineaId, trailerId },
  });
  if (!linea)
    throw new AppError(
      404,
      `La línea ${lineaId} no pertenece al trailer ${trailerId}`,
    );
  return linea;
}

export async function actualizarLinea(
  trailerId: number,
  lineaId: number,
  input: ActualizarManifiestoLineaInput,
): Promise<TrailerDto> {
  const actual = await lineaDelTrailer(trailerId, lineaId);

  // Revisa la combinación producto/color tal como quedaría después del cambio.
  const producto = input.producto ?? actual.producto;
  const color = input.color !== undefined ? input.color || null : actual.color;
  const errorColor = errorDeColor(producto, color);
  if (errorColor) throw new AppError(400, errorColor);

  if (input.cajas !== undefined) {
    const vendidas = (await vendidasPorLinea([lineaId])).get(lineaId) ?? 0;
    if (input.cajas < vendidas) {
      throw new AppError(
        409,
        `Ya se vendieron ${vendidas} cajas de esta línea; no puede quedar con ${input.cajas}`,
      );
    }
  }
  await prisma.manifiestoDetalle.update({
    where: { id: lineaId },
    data: {
      ...input,
      ...(input.color !== undefined && { color: input.color || null }),
    },
  });
  return obtenerTrailer(trailerId);
}

export async function eliminarLinea(
  trailerId: number,
  lineaId: number,
): Promise<TrailerDto> {
  await lineaDelTrailer(trailerId, lineaId);
  const ventas = await prisma.ticketDetalle.count({
    where: { manifiestoDetalleId: lineaId },
  });
  if (ventas > 0) {
    throw new AppError(
      409,
      "No se puede eliminar una línea que ya tiene ventas registradas",
    );
  }
  await prisma.manifiestoDetalle.delete({ where: { id: lineaId } });
  return obtenerTrailer(trailerId);
}
