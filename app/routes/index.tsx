import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import FingerPrintIcon from '@heroicons/react/outline/FingerPrintIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import UserGroupIcon from '@heroicons/react/outline/UserGroupIcon';
import UsersIcon from '@heroicons/react/outline/UsersIcon';
import ClockIcon from '@heroicons/react/outline/ClockIcon';
import { Link, useLoaderData, type LoaderFunction } from 'remix';
import HasRights from '~/component/HasRights';
import { Stat } from '~/component/Stat';
import { Stats } from '~/component/Stats';
import { getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessionsCount } from '~/services/session.server';
import { getTeamsCount } from '~/services/teams.server';
import { getTokensCount } from '~/services/tokens.server';
import { getUsersCount } from '~/services/users.server';
import { formatDuration } from '~/utils/intl';
import { getTimeSaved } from '~/services/events.server';
import { SourceType } from '~/types/vercel/turborepo';
import TimeSavedStats from '~/component/TimeSavedStats';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const [users, teams, sessions, artifacts, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUsersCount(),
    getTeamsCount(),
    getSessionsCount(),
    getArtifactsCount(),
    getTokensCount(),
    getTimeSaved(SourceType.LOCAL),
    getTimeSaved(SourceType.REMOTE),
  ]);
  return {
    users,
    teams,
    sessions,
    artifacts,
    tokens,
    savedLocally,
    savedRemotely,
  };
};

export default function DashBoard() {
  const { users, teams, sessions, artifacts, tokens, savedLocally, savedRemotely } = useLoaderData<{
    users: number;
    teams: number;
    sessions: number;
    artifacts: number;
    tokens: number;
    savedLocally: number;
    savedRemotely: number;
  }>();
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <Stats>
        <Stat
          icon={<UsersIcon className="w-8 h-8" />}
          title={
            <Link to="/sessions" prefetch="intent">
              Users
            </Link>
          }
          value={users}
        />
        <Stat
          icon={<UserGroupIcon className="w-8 h-8" />}
          title={
            <Link to="/sessions" prefetch="intent">
              Teams
            </Link>
          }
          value={teams}
        />
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
        <HasRights predicate={(u) => u.isSuperAdmin}>
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
