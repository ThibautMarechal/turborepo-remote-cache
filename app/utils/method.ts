import { methodNotAllowed, noContent } from './response';

export enum METHOD {
  GET = 'GET',
  HEAD = 'HEAD',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
}

export function allowMethods(request: Request, ...methods: METHOD[]) {
  if (request.method === METHOD.OPTIONS) {
    throw noContent(null, {
      headers: {
        'Access-Control-Allow-Methods': [METHOD.OPTIONS, ...methods].join(','),
      },
    });
  }
  if (!methods.includes(request.method as METHOD)) {
    throw methodNotAllowed();
  }
}
