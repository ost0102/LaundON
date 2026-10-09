import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { prisma } from '@/lib/db/prisma';
import type { UserModel } from '@/generated/prisma/models';
import type { AuthUser } from '@/types/auth';

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

function toAuthUser(record: UserModel): AuthUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
    createdAt: record.createdAt.toISOString(),
  };
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
}

export async function createUser(email: string, password: string, name: string): Promise<AuthUser> {
  const passwordSalt = randomBytes(16).toString('hex');
  const record = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: hashPassword(password, passwordSalt),
      passwordSalt,
    },
  });
  return toAuthUser(record);
}

export function verifyUserPassword(record: UserModel, password: string): boolean {
  const candidateHash = Buffer.from(hashPassword(password, record.passwordSalt), 'hex');
  const storedHash = Buffer.from(record.passwordHash, 'hex');
  return candidateHash.length === storedHash.length && timingSafeEqual(candidateHash, storedHash);
}

export function toPublicUser(record: UserModel): AuthUser {
  return toAuthUser(record);
}

export function findUsersByName(name: string) {
  return prisma.user.findMany({ where: { name: name.trim() } });
}

/** Returns false if no account exists for that email. */
export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  const record = await findUserByEmail(email);
  if (!record) return false;

  const passwordSalt = randomBytes(16).toString('hex');
  await prisma.user.update({
    where: { id: record.id },
    data: { passwordSalt, passwordHash: hashPassword(newPassword, passwordSalt) },
  });
  return true;
}
