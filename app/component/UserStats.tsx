import * as React from 'react';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import FingerPrintIcon from '@heroicons/react/24/outline/FingerPrintIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import { Link } from '@remix-run/react';
import Stat from './Stat';
import Stats from './Stats';
import HasRights from './HasRights';
import { isAdmin } from '~/roles/rights';

type Props = {
  sessions: number;
  artifacts: number;
  tokens: number;
  userId: string;
};

export const UserStats = ({ userId, sessions, artifacts, tokens }: Props) => {
  return (
    <Stats>
      <Stat
        icon={<BoltIcon className="w-8 h-8" />}
        title={
          <Link to="./sessions" prefetch="intent">
            Sessions
          </Link>
        }
        value={sessions}
        description={'Number of "turbo run <command>"'}
      />
      <Stat
        icon={<ArchiveBoxIcon className="w-8 h-8" />}
        title={
          <Link to="./artifacts" prefetch="intent">
            Artifacts
          </Link>
        }
        value={artifacts}
        description={'Artifacts pushed by the user'}
      />
      <HasRights predicate={(u) => isAdmin(u) || u.id === userId}>
        <Stat
          icon={<FingerPrintIcon className="w-8 h-8" />}
          title={
            <Link to="./tokens" prefetch="intent">
              Tokens
            </Link>
          }
          value={tokens}
        />
      </HasRights>
    </Stats>
  );
};

export default UserStats;
