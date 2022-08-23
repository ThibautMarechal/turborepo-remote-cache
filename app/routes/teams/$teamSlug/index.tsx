import type { LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { requireCookieAuth } from '~/services/authentication.server';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { getTeamDetailBySlug } from '~/services/teams.server';
import Stats from '~/component/Stats';
import Stat from '~/component/Stat';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import TimeSavedStats from '~/component/TimeSavedStats';
import type { TimeSavedByMonth } from '~/services/events.server';
import { getTimeSavedByMonth } from '~/services/events.server';
import { SourceType } from '~/types/vercel/turborepo';
import type { TeamDetail } from '~/types/prisma';
import { getSessionsCount } from '~/services/session.server';
import { getArtifactsCount, getArtifactsSize } from '~/services/artifact.server';
import { isTeamOwner } from '~/roles/rights';
import { json, useLoaderData } from '~/utils/superjson';
import HasRights from '~/component/HasRights';
import StorageStats from '~/component/StorageStats';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamDetailBySlug(params.teamSlug as string);
  const isOwner = isTeamOwner(user, team.id);
  const [sessions, artifacts, artifactsSize, savedLocally, savedRemotely] = await Promise.all([
    isOwner ? getSessionsCount({ teamId: team.id }) : 0,
    isOwner ? getArtifactsCount({ teamId: team.id }) : 0,
    isOwner ? getArtifactsSize({ teamId: team.id }) : 0,
    getTimeSavedByMonth(SourceType.LOCAL, { teamId: team.id }),
    getTimeSavedByMonth(SourceType.REMOTE, { teamId: team.id }),
  ]);
  return json({ team, sessions, artifacts, artifactsSize, savedLocally, savedRemotely });
};

export default function Team() {
  const { team, sessions, artifacts, artifactsSize, savedLocally, savedRemotely } = useLoaderData<{
    team: TeamDetail;
    sessions: number;
    artifacts: number;
    artifactsSize: number;
    savedLocally: TimeSavedByMonth[];
    savedRemotely: TimeSavedByMonth[];
  }>();
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            {team.name}
            <HasRights predicate={(u) => isTeamOwner(u, team.id)}>
              <Link to="./edit" prefetch="intent" className="btn btn-xs absolute top-1 right-1">
                <PencilIcon className="h-4 w-4" />
              </Link>
            </HasRights>
          </h2>
          <div>
            <span className="font-bold mr-2">Name:</span>
            {team.name}
            <br />
            <span className="font-bold mr-2">Slug:</span>
            {team.slug}
            <br />
          </div>
        </div>
      </div>
      <Stats>
        <Stat
          title={
            <Link to="./users" prefetch="intent">
              Users
            </Link>
          }
          icon={<UserGroupIcon className="w-8 h-8" />}
          value={team.members.length}
          description={'Users in the team'}
        />
        <HasRights predicate={(u) => isTeamOwner(u, team.id)}>
          <Stat
            title={
              <Link to="./sessions" prefetch="intent">
                Sessions
              </Link>
            }
            icon={<BoltIcon className="w-8 h-8" />}
            value={sessions}
            description={'Number of "turbo run <command>"'}
          />
          <Stat
            title={
              <Link to="./artifacts" prefetch="intent">
                Artifacts
              </Link>
            }
            icon={<ArchiveBoxIcon className="w-8 h-8" />}
            value={artifacts}
            description={'Artifacts linked to the team'}
          />
        </HasRights>
      </Stats>
      <HasRights predicate={(u) => isTeamOwner(u, team.id)}>
        <StorageStats size={artifactsSize} />
        <TimeSavedStats local={savedLocally} remote={savedRemotely} />
      </HasRights>
    </div>
  );
}
