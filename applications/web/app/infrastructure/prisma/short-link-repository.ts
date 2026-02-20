import type { ShortLinkRepository } from "@url-shortener/engine";
import type {
  ShortLink as DomainShortLink,
  ShortLinkWithStats,
} from "@url-shortener/engine";
import type { PrismaClient } from "generated/prisma";

type ShortLinkRowWithCount = {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: Date;
  _count: { clicks: number };
};

function toDomain(row: {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: Date;
}): DomainShortLink {
  return {
    id: row.id,
    code: row.code,
    originalUrl: row.originalUrl,
    createdAt: row.createdAt,
  };
}

export function createShortLinkRepository(
  prisma: PrismaClient,
): ShortLinkRepository {
  return {
    async create(data) {
      const shortLink = await prisma.shortLink.create({
        data: {
          code: data.code,
          originalUrl: data.originalUrl,
        },
      });
      return toDomain(shortLink);
    },

    async getByCode(code: string) {
      const shortLink = await prisma.shortLink.findUnique({
        where: { code },
      });
      return shortLink ? toDomain(shortLink) : null;
    },

    async listWithStats(): Promise<ShortLinkWithStats[]> {
      const rows = await prisma.shortLink.findMany({
        include: {
          _count: { select: { clicks: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((row: ShortLinkRowWithCount) => ({
        ...toDomain(row),
        clickCount: row._count.clicks,
      }));
    },

    async recordClick(code: string): Promise<void> {
      const shortLink = await prisma.shortLink.findUnique({ where: { code } });
      if (!shortLink) return;
      await prisma.click.create({
        data: { shortLinkId: shortLink.id },
      });
    },
  };
}
