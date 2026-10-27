-- AlterTable
ALTER TABLE "trailers" ADD COLUMN     "fecha_cierre" TIMESTAMP(3),
ADD COLUMN     "viaje" TEXT;

-- CreateIndex
CREATE INDEX "trailers_estado_fecha_cierre_idx" ON "trailers"("estado", "fecha_cierre");

-- Los trailers que ya estaban cerrados toman su última modificación como fecha de cierre.
UPDATE "trailers" SET "fecha_cierre" = "updated_at" WHERE "estado" = 'CERRADO';
