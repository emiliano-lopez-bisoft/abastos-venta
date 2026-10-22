# Ventas del andén

Sistema para registrar trailers, manifiestos, tickets de venta y el resumen diario.

Monorepo con npm workspaces:

| Carpeta     | Qué es                                                        |
|-------------|---------------------------------------------------------------|
| `shared/`   | Esquemas de validación (Zod) y tipos que usan front y back    |
| `backend/`  | API en Express 5 + TypeScript + Prisma 7 (PostgreSQL)         |
| `frontend/` | Angular 22 (después se convierte en PWA)                      |

## Requisitos

- Node 24.15 o superior
- Una base de PostgreSQL (por ejemplo, un proyecto gratuito en Neon o Supabase)

## Primeros pasos

```bash
npm install                           # instala todo y genera el cliente de Prisma
cp backend/.env.example backend/.env  # en Windows: copy backend\.env.example backend\.env
# Edita backend/.env y pega tu cadena de conexión en DATABASE_URL
npm run db:migrate -w backend -- --name inicial
npm run dev                           # API en :3000 y Angular en :4200
```

Abre http://localhost:4200. Si ves "Servidor y base de datos conectados", todo quedó listo.

## Scripts útiles

| Comando                           | Qué hace                                         |
|-----------------------------------|--------------------------------------------------|
| `npm run dev`                     | Compila `shared` y levanta API + frontend        |
| `npm run typecheck`               | Revisa tipos de `shared` y `backend`             |
| `npm run db:migrate -w backend`   | Crea y aplica una migración tras cambiar el schema |
| `npm run db:studio -w backend`    | Abre Prisma Studio para ver los datos            |
| `npm run ng -w frontend -- g c x` | Usa la CLI de Angular local (no hace falta `ng` global) |

Si cambias algo en `shared/`, vuelve a compilarlo con `npm run build:shared`
(o deja corriendo `npm run watch -w @abastos/shared`).

## Reglas del proyecto

- Los importes se guardan como `Decimal(12,2)` y los totales se calculan en el backend.
- Cada línea de ticket apunta a una línea del manifiesto: así se sabe de qué trailer salió cada caja.
- El `id` del ticket es su folio consecutivo.
- El archivo `.env` nunca se sube al repositorio.
