/**
 * Domain types for short links. Used by the engine and repository implementations.
 */

export interface ShortLink {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: Date;
}

export interface ShortLinkWithStats extends ShortLink {
  clickCount: number;
}
