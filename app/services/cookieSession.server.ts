import { createCookieSessionStorage } from '@remix-run/node';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.COOKIE_SECRET ?? 'COOKIE_SECRET'], // replace this with an actual secret
    secure: false, // process.env.COOKIE_NOT_SECURE !== 'true' && process.env.NODE_ENV === 'production', // enable this in prod & https only
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
