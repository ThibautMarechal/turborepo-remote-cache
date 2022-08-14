import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import FingerPrintIcon from '@heroicons/react/outline/FingerPrintIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import UserGroupIcon from '@heroicons/react/outline/UserGroupIcon';
import UsersIcon from '@heroicons/react/outline/UsersIcon';
import type { LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import HasRights from '~/component/HasRights';
import { Stat } from '~/component/Stat';
import { Stats } from '~/component/Stats';
import { getArtifactsCount } from '~/services/artifact.server';
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

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await requireCookieAuth(request);
  const [users, teams, sessions, artifacts, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUsersCount(),
    getTeamsCount(),
    getSessionsCount(),
    getArtifactsCount(),
    getTokensCount(),
    getTimeSavedByMonth(SourceType.LOCAL, { userId: user.id }),
    getTimeSavedByMonth(SourceType.REMOTE, { userId: user.id }),
  ]);
  return json({
    users,
    teams,
    sessions,
    artifacts,
    tokens,
    savedLocally,
    savedRemotely,
  });
};

export default function DashBoard() {
  const { users, teams, sessions, artifacts, tokens, savedLocally, savedRemotely } = useLoaderData<{
    users: number;
    teams: number;
    sessions: number;
    artifacts: number;
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
            icon={<LightningBoltIcon className="w-8 h-8" />}
            title={
              <Link to="/sessions" prefetch="intent">
                Sessions
              </Link>
            }
            value={sessions}
            description={'Number of "turbo run <command>"'}
          />
          <Stat
            icon={<ArchiveIcon className="w-8 h-8" />}
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
      <TimeSavedStats local={savedLocally} remote={savedRemotely} />
    </div>
  );
}
