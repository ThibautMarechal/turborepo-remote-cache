import { makeDomainFunction, toComposable } from 'domain-functions';
import { formAction } from '~/formAction';
import { startArtifactCleanup } from '~/services/artifact.server';
import { cleanSchema } from './schema';

/**
 * Handle a clean form submission: start the artifact cleanup for the given scope in background
 * and redirect to `successPath`.
 */
export function cleanAction(request: Request, { userId, teamId, successPath }: { userId?: string; teamId?: string; successPath: string }) {
  const mutation = toComposable(makeDomainFunction(cleanSchema)(async ({ period }) => startArtifactCleanup(period, { userId, teamId })));
  return formAction({
    request,
    schema: cleanSchema,
    mutation,
    successPath,
  });
}
