import { METHOD, allowMethods } from './method';
import { expect } from 'vitest';

it(`allow ${METHOD.OPTIONS} by default`, () => {
  try {
    allowMethods(new Request('http://localhost', { method: METHOD.OPTIONS }));
  } catch (error) {
    expect(error).toBeInstanceOf(Response);
    const response = error as Response;
    expect(response.headers.get('access-control-allow-methods')).toBe(METHOD.OPTIONS);
  }
});

it(`Does not throw if he the request is not of method ${METHOD.OPTIONS} and the method is allowed`, () => {
  expect(allowMethods(new Request('http://localhost', { method: METHOD.GET }), METHOD.GET)).not.toThrow(Response);
});

it(`throw 405 if the method is not allowed`, () => {
  try {
    expect(allowMethods(new Request('http://localhost', { method: METHOD.POST }), METHOD.GET)).not.toThrow(Response);
  } catch (error) {
    expect(error).toBeInstanceOf(Response);
    const response = error as Response;
    expect(response.status).toBe(405);
  }
});
