import { PrismaClient } from "generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ShortLinkRepository } from "@url-shortener/engine";
import { createShortLinkRepository } from "~/infrastructure/prisma/short-link-repository";

let prisma: PrismaClient | null = null;
let shortLinkRepository: ShortLinkRepository | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export function getShortLinkRepository(): ShortLinkRepository {
  if (!shortLinkRepository) {
    shortLinkRepository = createShortLinkRepository(getPrisma());
  }
  return shortLinkRepository;
}
