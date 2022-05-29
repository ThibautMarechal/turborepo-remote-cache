import { Link, useLoaderData, type LoaderFunction } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { getTeamDetail } from '~/services/teams.server';
import Stats from '~/component/Stats';
import Stat from '~/component/Stat';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import UserGroupIcon from '@heroicons/react/outline/UserGroupIcon';
import TimeSavedStats from '~/component/TimeSavedStats';
import { getTimeSaved } from '~/services/events.server';
import { SourceType } from '~/types/vercel/turborepo';
import type { TeamDetail } from '~/types/prisma';
import { getSessionsByTeamCount } from '~/services/session.server';
import { getArtifactsByTeamCount } from '~/services/artifact.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const [team, sessions, artifacts, savedLocally, savedRemotely] = await Promise.all([
    getTeamDetail(params.id as string),
    getSessionsByTeamCount(params.id as string),
    getArtifactsByTeamCount(params.id as string),
    getTimeSaved(SourceType.LOCAL, { teamId: params.id as string }),
    getTimeSaved(SourceType.REMOTE, { teamId: params.id as string }),
  ]);
  return { team, sessions, artifacts, savedLocally, savedRemotely };
};

export default function Team() {
  const { team, sessions, artifacts, savedLocally, savedRemotely } = useLoaderData<{
    team: TeamDetail;
    sessions: number;
    artifacts: number;
    savedLocally: number;
    savedRemotely: number;
  }>();
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            {team.name}
            <Link to="./edit" prefetch="intent" className="btn btn-xs absolute top-0 right-0">
              <PencilIcon className="h-4 w-4" />
            </Link>
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
            <Link to="./sessions" prefetch="intent">
              Sessions
            </Link>
          }
          icon={<LightningBoltIcon className="w-8 h-8" />}
          value={sessions}
          description={'Number of "turbo run <command>"'}
        />
        <Stat
          title={
            <Link to="./artifacts" prefetch="intent">
              Artifacts
            </Link>
          }
          icon={<ArchiveIcon className="w-8 h-8" />}
          value={artifacts}
          description={'Artifacts linked to the team'}
        />
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
      </Stats>
      <TimeSavedStats local={savedLocally} remote={savedRemotely} />
    </div>
  );
}
