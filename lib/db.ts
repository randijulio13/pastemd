import crypto from "crypto";
import { prisma } from "./prisma";

export interface Paste {
  id: string;
  content: string;
  passwordHash?: string;
  passwordSalt?: string;
  expiresAt?: string | null;
  createdAt: string;
  isPasswordProtected: boolean;
}

// Secure password hashing using native scrypt
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  } catch (e) {
    return false;
  }
}

// Helper to generate a nice readable unique ID
function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(crypto.randomInt(chars.length));
  }
  return result;
}

function mapPrismaPaste(paste: {
  id: string;
  content: string;
  passwordHash: string | null;
  passwordSalt: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  isPasswordProtected: boolean;
}): Paste {
  return {
    id: paste.id,
    content: paste.content,
    passwordHash: paste.passwordHash ?? undefined,
    passwordSalt: paste.passwordSalt ?? undefined,
    expiresAt: paste.expiresAt ? paste.expiresAt.toISOString() : null,
    createdAt: paste.createdAt.toISOString(),
    isPasswordProtected: paste.isPasswordProtected,
  };
}

export async function getPaste(id: string): Promise<Paste | null> {
  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) return null;

  // Check expiration
  if (paste.expiresAt && paste.expiresAt < new Date()) {
    // Delete expired paste
    await prisma.paste.delete({ where: { id } });
    return null;
  }

  return mapPrismaPaste(paste);
}

export async function createPaste(
  content: string,
  password?: string,
  expiration?: string
): Promise<Paste> {
  let id = generateShortId();

  // Ensure uniqueness
  while (await prisma.paste.findUnique({ where: { id } })) {
    id = generateShortId();
  }

  let expiresAt: Date | null = null;

  if (expiration && expiration !== "never") {
    const now = new Date();
    if (expiration === "1h") {
      now.setHours(now.getHours() + 1);
    } else if (expiration === "1d") {
      now.setDate(now.getDate() + 1);
    } else if (expiration === "1w") {
      now.setDate(now.getDate() + 7);
    } else if (expiration === "1m") {
      now.setMonth(now.getMonth() + 1);
    }
    expiresAt = now;
  }

  let passwordHash: string | undefined;
  let passwordSalt: string | undefined;

  if (password && password.trim() !== "") {
    const { hash, salt } = hashPassword(password);
    passwordHash = hash;
    passwordSalt = salt;
  }

  const newPaste = await prisma.paste.create({
    data: {
      id,
      content,
      passwordHash,
      passwordSalt,
      expiresAt,
      isPasswordProtected: !!passwordHash,
    },
  });

  return mapPrismaPaste(newPaste);
}

export async function cleanupExpired(): Promise<void> {
  await prisma.paste.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
