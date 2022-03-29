import { createHash } from 'crypto';

export function hash(string: string) {
  return createHash('sha256').update(string).digest('hex');
}
