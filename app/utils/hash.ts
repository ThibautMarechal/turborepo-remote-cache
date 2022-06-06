import { createHash } from 'crypto';

export async function hash(string: string) {
  return createHash('sha256').update(string).digest('hex');
}

export async function compareHash(string: string, hashed: string) {
  return (await hash(string)) === hashed;
}
