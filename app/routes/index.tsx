import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import FingerPrintIcon from '@heroicons/react/24/outline/FingerPrintIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import type { LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import HasRights from '~/component/HasRights';
import { Stat } from '~/component/Stat';
import { Stats } from '~/component/Stats';
import { getArtifactsCount, getArtifactsSize } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessionsCount } from '~/services/session.server';
import { getTeamsCount } from '~/services/teams.server';
import { getTokensCount } from '~/services/tokens.server';
import { getUsersCount } from '~/services/users.server';
import type { TimeSavedByMonth } from '~/services/events.server';
import { getTimeSavedByMonth } from '~/services/events.server';
import { SourceType } from '~/types/vercel/turborepo';
import TimeSavedStats from '~/component/TimeSavedStats';
import { isAdmin } from '~/roles/rights';
import { json, useLoaderData } from '~/utils/superjson';
import StorageStats from '~/component/StorageStats';
import NoSsr from '~/component/NoSsr';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const [users, teams, sessions, artifacts, artifactsSize, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUsersCount(),
    getTeamsCount(),
    getSessionsCount(),
    getArtifactsCount(),
    getArtifactsSize(),
    getTokensCount(),
    getTimeSavedByMonth(SourceType.LOCAL),
    getTimeSavedByMonth(SourceType.REMOTE),
  ]);
  return json({
    users,
    teams,
    sessions,
    artifacts,
    artifactsSize,
    tokens,
    savedLocally,
    savedRemotely,
  });
};

export default function DashBoard() {
  const { users, teams, sessions, artifacts, artifactsSize, tokens, savedLocally, savedRemotely } = useLoaderData<{
    users: number;
    teams: number;
    sessions: number;
    artifacts: number;
    artifactsSize: number;
    tokens: number;
    savedLocally: TimeSavedByMonth[];
    savedRemotely: TimeSavedByMonth[];
  }>();
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <Stats>
        <Stat
          icon={<UsersIcon className="w-8 h-8" />}
          title={
            <Link to="/users" prefetch="intent">
              Users
            </Link>
          }
          value={users}
        />
        <Stat
          icon={<UserGroupIcon className="w-8 h-8" />}
          title={
            <Link to="/teams" prefetch="intent">
              Teams
            </Link>
          }
          value={teams}
        />
        <HasRights predicate={(u) => isAdmin(u)}>
          <Stat
            icon={<BoltIcon className="w-8 h-8" />}
            title={
              <Link to="/sessions" prefetch="intent">
                Sessions
              </Link>
            }
            value={sessions}
            description={'Number of "turbo run <command>"'}
          />
          <Stat
            icon={<ArchiveBoxIcon className="w-8 h-8" />}
            title={
              <Link to="/artifacts" prefetch="intent">
                Artifacts
              </Link>
            }
            value={artifacts}
            description={'Artifacts pushed by the user'}
          />
          <Stat
            icon={<FingerPrintIcon className="w-8 h-8" />}
            title={
              <Link to="/tokens" prefetch="intent">
                Tokens
              </Link>
            }
            value={tokens}
          />
        </HasRights>
      </Stats>
      <StorageStats size={artifactsSize} />
      <NoSsr>
        <TimeSavedStats local={savedLocally} remote={savedRemotely} />
      </NoSsr>
    </div>
  );
}
