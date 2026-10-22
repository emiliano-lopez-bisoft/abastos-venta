-- CreateEnum
CREATE TYPE "EstadoTrailer" AS ENUM ('ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('VIGENTE', 'CANCELADO');

-- CreateTable
CREATE TABLE "trailers" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "invernadero" TEXT NOT NULL,
    "chofer" TEXT NOT NULL,
    "anden" TEXT NOT NULL,
    "costo_anden" DECIMAL(12,2) NOT NULL,
    "fecha_llegada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoTrailer" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifiesto_detalle" (
    "id" SERIAL NOT NULL,
    "trailer_id" INTEGER NOT NULL,
    "producto" TEXT NOT NULL,
    "color" TEXT,
    "tamano" TEXT NOT NULL,
    "cajas" INTEGER NOT NULL,

    CONSTRAINT "manifiesto_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_nombre" TEXT NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'VIGENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_detalle" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "manifiesto_detalle_id" INTEGER NOT NULL,
    "cajas" INTEGER NOT NULL,
    "precio_caja" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ticket_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trailers_fecha_llegada_idx" ON "trailers"("fecha_llegada");

-- CreateIndex
CREATE INDEX "manifiesto_detalle_trailer_id_idx" ON "manifiesto_detalle"("trailer_id");

-- CreateIndex
CREATE INDEX "tickets_fecha_idx" ON "tickets"("fecha");

-- CreateIndex
CREATE INDEX "ticket_detalle_ticket_id_idx" ON "ticket_detalle"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_detalle_manifiesto_detalle_id_idx" ON "ticket_detalle"("manifiesto_detalle_id");

-- AddForeignKey
ALTER TABLE "manifiesto_detalle" ADD CONSTRAINT "manifiesto_detalle_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "trailers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_detalle" ADD CONSTRAINT "ticket_detalle_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_detalle" ADD CONSTRAINT "ticket_detalle_manifiesto_detalle_id_fkey" FOREIGN KEY ("manifiesto_detalle_id") REFERENCES "manifiesto_detalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
