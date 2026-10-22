import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Se lee directo de process.env para que `prisma generate` funcione aunque
  // todavía no exista el .env (por ejemplo, justo después de clonar).
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
