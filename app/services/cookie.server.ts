import { randomBytes } from 'node:crypto';
import { createCookie, createCookieSessionStorage } from 'react-router';

// An empty COOKIE_SECRET (the Docker image declares it empty) counts as unset. Without a secret, use a random one:
// sessions are then lost on restart, but cookies can't be forged with a guessable default secret.
const cookieSecret = process.env.COOKIE_SECRET || randomBytes(32).toString('hex');
if (!process.env.COOKIE_SECRET) {
  console.warn('COOKIE_SECRET is not set: using a random secret, users will be logged out when the server restarts.');
}

const secureCookie = process.env.COOKIE_NOT_SECURE !== 'true' && process.env.NODE_ENV === 'production';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [cookieSecret],
    secure: secureCookie, // enable this in prod & https only
  },
});

export const redirectToCookie = createCookie('redirect_to', {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  secure: secureCookie,
});
