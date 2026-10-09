import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __laundryNowPrisma: PrismaClient | undefined;
}

// Prisma 7 removed the schema-level `url = env(...)` datasource shortcut -
// the client now always needs an explicit driver adapter. Next.js
// hot-reloads modules in dev, which would otherwise spawn a new
// PrismaClient (and a new connection pool) on every edit, so the single
// instance is stashed on globalThis - same pattern already used by mocks/*.ts.
export const prisma: PrismaClient = (globalThis.__laundryNowPrisma ??= new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
}));
