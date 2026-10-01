import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

import type { AuthUser } from '@/types/auth';

/**
 * In-memory mock user "database" (server-side only - this module is only
 * imported from route handlers). Stands in for a real user table; swap for
 * an actual database call when a backend exists.
 */
interface MockUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __laundryNowMockUsers: MockUserRecord[] | undefined;
}

// Next.js bundles each route handler separately, so a plain module-level
// array would be a different instance per route (signup and login would
// each see their own empty list). Stashing it on globalThis keeps one
// shared instance for the whole dev server process.
const users: MockUserRecord[] = (globalThis.__laundryNowMockUsers ??= []);

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

function toAuthUser(record: MockUserRecord): AuthUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    createdAt: record.createdAt,
  };
}

export function findMockUserByEmail(email: string): MockUserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return users.find((user) => user.email === normalized);
}

export function createMockUser(email: string, password: string, name: string): AuthUser {
  const normalized = email.trim().toLowerCase();
  const passwordSalt = randomBytes(16).toString('hex');

  const record: MockUserRecord = {
    id: randomUUID(),
    email: normalized,
    name: name.trim(),
    passwordHash: hashPassword(password, passwordSalt),
    passwordSalt,
    createdAt: new Date().toISOString(),
  };

  users.push(record);
  return toAuthUser(record);
}

export function verifyMockUserPassword(record: MockUserRecord, password: string): boolean {
  const candidateHash = Buffer.from(hashPassword(password, record.passwordSalt), 'hex');
  const storedHash = Buffer.from(record.passwordHash, 'hex');
  return candidateHash.length === storedHash.length && timingSafeEqual(candidateHash, storedHash);
}

export function toPublicUser(record: MockUserRecord): AuthUser {
  return toAuthUser(record);
}

export function findMockUsersByName(name: string): MockUserRecord[] {
  const normalized = name.trim();
  return users.filter((user) => user.name === normalized);
}

/** Returns false if no account exists for that email. */
export function updateMockUserPassword(email: string, newPassword: string): boolean {
  const record = findMockUserByEmail(email);
  if (!record) return false;

  record.passwordSalt = randomBytes(16).toString('hex');
  record.passwordHash = hashPassword(newPassword, record.passwordSalt);
  return true;
}
