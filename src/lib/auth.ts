import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { createHash, randomBytes } from 'crypto';

const COOKIE_NAME = 'kv_session';
const SESSION_TTL_DAYS = 7;

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET must be defined and >= 32 chars');
  }
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const rawToken = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: { userId, tokenHash, userAgent, ip, expiresAt },
  });

  const jwt = await new SignJWT({ sid: rawToken, uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecret());

  cookies().set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const c = cookies().get(COOKIE_NAME);
  if (c?.value) {
    try {
      const { payload } = await jwtVerify(c.value, getSecret());
      const sid = payload.sid as string;
      if (sid) {
        const tokenHash = createHash('sha256').update(sid).digest('hex');
        await prisma.adminSession.deleteMany({ where: { tokenHash } }).catch(() => null);
      }
    } catch {}
  }
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const c = cookies().get(COOKIE_NAME);
  if (!c?.value) return null;
  try {
    const { payload } = await jwtVerify(c.value, getSecret());
    const uid = payload.uid as string;
    if (!uid) return null;
    const user = await prisma.adminUser.findUnique({ where: { id: uid } });
    if (!user || !user.active) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export function hashPassword(plain: string): string {
  // bcrypt lazy import to avoid bundling
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(plain, hash);
}
