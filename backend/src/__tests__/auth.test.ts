import { describe, expect, it } from "vitest";
import {
  getUserFromAuthHeader,
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
} from "../lib/auth.js";

describe("password hashing", () => {
  it("hashes a password and can verify it", async () => {
    const hash = await hashPassword("supersecret123");
    expect(hash).not.toBe("supersecret123");
    expect(await verifyPassword("supersecret123", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("supersecret123");
    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });
});

describe("JWT tokens", () => {
  it("signs a token and verifies it back to the same payload", () => {
    const token = signToken({ userId: "user-1", email: "a@b.com" });
    const payload = verifyToken(token);
    expect(payload?.userId).toBe("user-1");
    expect(payload?.email).toBe("a@b.com");
  });

  it("returns null for a garbage token", () => {
    expect(verifyToken("not-a-real-token")).toBeNull();
  });

  it("extracts a user from a valid Bearer header", () => {
    const token = signToken({ userId: "user-2", email: "c@d.com" });
    const payload = getUserFromAuthHeader(`Bearer ${token}`);
    expect(payload?.userId).toBe("user-2");
  });

  it("returns null when the header is missing or malformed", () => {
    expect(getUserFromAuthHeader(null)).toBeNull();
    expect(getUserFromAuthHeader(undefined)).toBeNull();
    expect(getUserFromAuthHeader("Basic abc123")).toBeNull();
  });
});
