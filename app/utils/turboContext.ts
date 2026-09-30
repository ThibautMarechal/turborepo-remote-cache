import type { LoaderFunctionArgs } from 'react-router';
import type { TurboContext } from '~/types/TurboContext';
import type { Team, User } from '@prisma/client';

export function getTurboContext({ request, params }: Pick<LoaderFunctionArgs, 'request' | 'params' | 'context'>, user: User, team: Team | null): TurboContext {
  const { hash } = params;
  const durationString = request.headers.get(DURATION_HEADER);
  return {
    hash,
    team,
    duration: durationString ? Number.parseInt(durationString) : null,
    user,
  };
}

export const DURATION_HEADER = 'x-artifact-duration';
