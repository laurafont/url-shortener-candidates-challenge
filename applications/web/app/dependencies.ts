import { PrismaClient } from "generated/prisma";
import type { ShortLinkRepository } from "@url-shortener/engine";
import { createShortLinkRepository } from "~/infrastructure/prisma/short-link-repository";

let prisma: PrismaClient | null = null;
let shortLinkRepository: ShortLinkRepository | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    // Prisma reads DATABASE_URL from env when no adapter/accelerateUrl is passed
    prisma = new PrismaClient({} as ConstructorParameters<typeof PrismaClient>[0]);
  }
  return prisma;
}

export function getShortLinkRepository(): ShortLinkRepository {
  if (!shortLinkRepository) {
    shortLinkRepository = createShortLinkRepository(getPrisma());
  }
  return shortLinkRepository;
}
