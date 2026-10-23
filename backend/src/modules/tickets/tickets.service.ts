import type {
  CrearTicketInput,
  EstadoTicket,
  TicketDto,
} from "@abastos/shared";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { aNumero, decimal } from "../../lib/dinero.js";
import { hoyCdmx, rangoDelDia } from "../../lib/fechas.js";
import { AppError } from "../../middlewares/error-handler.js";

const conDetalles = {
  detalles: {
    orderBy: { id: "asc" },
    include: {
      manifiestoDetalle: {
        include: {
          trailer: { select: { id: true, numero: true, anden: true } },
        },
      },
    },
  },
} satisfies Prisma.TicketInclude;

type TicketConDetalles = Prisma.TicketGetPayload<{
  include: typeof conDetalles;
}>;

function aDto(t: TicketConDetalles): TicketDto {
  const lineas = t.detalles.map((d) => ({
    id: d.id,
    manifiestoDetalleId: d.manifiestoDetalleId,
    trailer: d.manifiestoDetalle.trailer,
    producto: d.manifiestoDetalle.producto,
    color: d.manifiestoDetalle.color,
    tamano: d.manifiestoDetalle.tamano,
    cajas: d.cajas,
    precioCaja: aNumero(d.precioCaja),
    subtotal: aNumero(d.subtotal),
  }));

  return {
    id: t.id,
    fecha: t.fecha.toISOString(),
    clienteNombre: t.clienteNombre,
    estado: t.estado,
    total: aNumero(t.total),
    totalCajas: lineas.reduce((acc, l) => acc + l.cajas, 0),
    lineas,
  };
}

// ---------- Casos de uso ----------

export async function crearTicket(input: CrearTicketInput): Promise<TicketDto> {
  // Cajas pedidas por línea de manifiesto (por si la misma línea viene dos veces).
  const pedidas = new Map<number, number>();
  for (const l of input.lineas) {
    pedidas.set(
      l.manifiestoDetalleId,
      (pedidas.get(l.manifiestoDetalleId) ?? 0) + l.cajas,
    );
  }
  const ids = [...pedidas.keys()].sort((a, b) => a - b);

  const ticketId = await prisma.$transaction(async (tx) => {
    // 1. Bloquear las líneas del manifiesto hasta que termine la transacción.
    //    Si dos ventas de la misma línea llegan al mismo tiempo, la segunda
    //    espera a que la primera termine y ya ve sus cajas vendidas.
    await tx.$queryRaw`
      SELECT id FROM manifiesto_detalle
      WHERE id IN (${Prisma.join(ids)})
      ORDER BY id
      FOR UPDATE`;

    // 2. Revisar que existan y que su trailer siga activo.
    const lineas = await tx.manifiestoDetalle.findMany({
      where: { id: { in: ids } },
      include: { trailer: { select: { numero: true, estado: true } } },
    });
    const porId = new Map(lineas.map((l) => [l.id, l]));

    for (const id of ids) {
      const linea = porId.get(id);
      if (!linea)
        throw new AppError(404, `No existe la línea de manifiesto ${id}`);
      if (linea.trailer.estado !== "ACTIVO") {
        throw new AppError(
          409,
          `El trailer ${linea.trailer.numero} está cerrado; no se puede vender de él`,
        );
      }
    }

    // 3. Revisar existencias (solo cuentan los tickets vigentes).
    const vendidas = await tx.ticketDetalle.groupBy({
      by: ["manifiestoDetalleId"],
      where: {
        manifiestoDetalleId: { in: ids },
        ticket: { estado: "VIGENTE" },
      },
      _sum: { cajas: true },
    });
    const vendidasPorId = new Map(
      vendidas.map((v) => [v.manifiestoDetalleId, v._sum.cajas ?? 0]),
    );

    for (const id of ids) {
      const linea = porId.get(id)!;
      const disponibles = linea.cajas - (vendidasPorId.get(id) ?? 0);
      const solicitadas = pedidas.get(id)!;
      if (solicitadas > disponibles) {
        const nombre = [linea.producto, linea.color, linea.tamano]
          .filter(Boolean)
          .join(" ");
        throw new AppError(
          409,
          `Solo quedan ${disponibles} cajas de ${nombre} (trailer ${linea.trailer.numero}); se pidieron ${solicitadas}`,
        );
      }
    }

    // 4. Calcular subtotales y total con Decimal (sin errores de redondeo).
    const detalles = input.lineas.map((l) => {
      const precioCaja = decimal(l.precioCaja);
      return {
        manifiestoDetalleId: l.manifiestoDetalleId,
        cajas: l.cajas,
        precioCaja,
        subtotal: precioCaja.mul(l.cajas),
      };
    });
    const total = detalles.reduce(
      (acc, d) => acc.add(d.subtotal),
      new Prisma.Decimal(0),
    );

    // 5. Guardar ticket y detalles.
    const ticket = await tx.ticket.create({
      data: {
        clienteNombre: input.clienteNombre,
        total,
        detalles: { create: detalles },
      },
      select: { id: true },
    });
    return ticket.id;
  });

  return obtenerTicket(ticketId);
}

export async function listarTickets(
  fecha?: string,
  estado?: EstadoTicket,
): Promise<TicketDto[]> {
  const { desde, hasta } = rangoDelDia(fecha ?? hoyCdmx());
  const tickets = await prisma.ticket.findMany({
    where: { fecha: { gte: desde, lt: hasta }, ...(estado && { estado }) },
    include: conDetalles,
    orderBy: { id: "desc" },
  });
  return tickets.map(aDto);
}

export async function obtenerTicket(id: number): Promise<TicketDto> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: conDetalles,
  });
  if (!ticket) throw new AppError(404, `No existe el ticket ${id}`);
  return aDto(ticket);
}

export async function cancelarTicket(id: number): Promise<TicketDto> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { estado: true },
  });
  if (!ticket) throw new AppError(404, `No existe el ticket ${id}`);
  if (ticket.estado === "CANCELADO")
    throw new AppError(409, `El ticket ${id} ya estaba cancelado`);

  await prisma.ticket.update({ where: { id }, data: { estado: "CANCELADO" } });
  return obtenerTicket(id);
}
