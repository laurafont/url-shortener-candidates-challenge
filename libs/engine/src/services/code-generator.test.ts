import { describe, it, expect } from "vitest";
import { generateShortCode } from "./code-generator";

const BASE62_CHARS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

describe("generateShortCode", () => {
  describe("length", () => {
    it("returns default length of 6", () => {
      for (let i = 0; i < 50; i++) {
        const code = generateShortCode();
        expect(code).toHaveLength(6);
      }
    });

    it("returns custom length when specified", () => {
      expect(generateShortCode(4)).toHaveLength(4);
      expect(generateShortCode(8)).toHaveLength(8);
      expect(generateShortCode(1)).toHaveLength(1);
    });
  });

  describe("character set", () => {
    it("uses only base62 characters (0-9, a-z, A-Z)", () => {
      for (let i = 0; i < 100; i++) {
        const code = generateShortCode();
        for (const char of code) {
          expect(BASE62_CHARS).toContain(char);
        }
      }
    });

    it("never produces characters outside base62", () => {
      const invalidChars: string[] = [];
      const base62Set = new Set(BASE62_CHARS.split(""));

      for (let i = 0; i < 200; i++) {
        const code = generateShortCode(8);
        for (const char of code) {
          if (!base62Set.has(char)) {
            invalidChars.push(char);
          }
        }
      }

      expect(invalidChars).toHaveLength(0);
    });
  });

  describe("uniqueness / no obvious collisions", () => {
    it("produces unique codes in a sample of 1000", () => {
      const sampleSize = 1000;
      const codes = new Set<string>();

      for (let i = 0; i < sampleSize; i++) {
        codes.add(generateShortCode());
      }

      expect(codes.size).toBe(sampleSize);
    });

    it("produces unique codes across different lengths", () => {
      const seen = new Set<string>();
      const lengths = [4, 6, 8, 10];

      for (const len of lengths) {
        for (let i = 0; i < 100; i++) {
          const code = generateShortCode(len);
          expect(seen.has(code)).toBe(false);
          seen.add(code);
        }
      }
    });
  });
});
