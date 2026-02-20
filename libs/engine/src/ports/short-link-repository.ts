import type { ShortLink, ShortLinkWithStats } from "../domain/short-link";

/**
 * Port (interface) for short link persistence.
 * Implemented by infrastructure (e.g. Prisma) in the web app.
 */
export interface ShortLinkRepository {
  create(data: { code: string; originalUrl: string }): Promise<ShortLink>;
  getByCode(code: string): Promise<ShortLink | null>;
  listWithStats(): Promise<ShortLinkWithStats[]>;
  recordClick(code: string): Promise<void>;
}
