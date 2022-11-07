import { createCookie, createCookieSessionStorage } from '@remix-run/node';

const secureCookie = process.env.COOKIE_NOT_SECURE !== 'true' && process.env.NODE_ENV === 'production';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.COOKIE_SECRET ?? 'COOKIE_SECRET'], // replace this with an actual secret
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
