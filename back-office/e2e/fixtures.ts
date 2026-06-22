import { test as base, Page } from '@playwright/test';
import type { Fixtures } from '@playwright/test';

export const test = base;

export const expect = test.expect;

export function createAuthToken(email: string = 'admin@test.com'): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    email,
    preferred_username: email,
    roles: ['ROLE_ADMIN'],
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${enc(header)}.${enc(payload)}.`;
}