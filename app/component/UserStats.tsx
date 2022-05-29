import * as React from 'react';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import FingerPrintIcon from '@heroicons/react/outline/FingerPrintIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import { Link } from 'remix';
import Stat from './Stat';
import Stats from './Stats';

type Props = {
  sessions: number | null;
  artifacts: number | null;
  tokens: number | null;
};

export const UserStats = ({ sessions, artifacts, tokens }: Props) => {
  return (
    <Stats>
      <Stat
        icon={<LightningBoltIcon className="w-8 h-8" />}
        title={
          <Link to="./sessions" prefetch="intent">
            Sessions
          </Link>
        }
        value={sessions}
        description={'Number of "turbo run <command>"'}
      />
      <Stat
        icon={<ArchiveIcon className="w-8 h-8" />}
        title={
          <Link to="./artifacts" prefetch="intent">
            Artifacts
          </Link>
        }
        value={artifacts}
        description={'Artifacts pushed by the user'}
      />
      <Stat
        icon={<FingerPrintIcon className="w-8 h-8" />}
        title={
          <Link to="./tokens" prefetch="intent">
            Tokens
          </Link>
        }
        value={tokens}
      />
    </Stats>
  );
};

export default UserStats;
