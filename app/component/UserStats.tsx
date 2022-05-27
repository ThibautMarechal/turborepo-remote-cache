import * as React from 'react';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import FingerPrintIcon from '@heroicons/react/outline/FingerPrintIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import type { Artifact, Session, Token, User } from '@prisma/client';
import { Link } from 'remix';
import Stat from './Stat';
import Stats from './Stats';

type Props = {
  user: User & { sessions: Session[]; artifacts: Artifact[]; tokens: Token[] };
  stats: Array<'sessions' | 'artifacts' | 'tokens'>;
};

export const UserStats = ({ user, stats }: Props) => {
  return (
    <Stats>
      {stats.includes('sessions') && (
        <Stat
          icon={<LightningBoltIcon className="w-8 h-8" />}
          title={
            <Link to="./sessions" prefetch="intent">
              Sessions
            </Link>
          }
          value={user.sessions.length}
          description={'Number of "turbo run <command>"'}
        />
      )}
      {stats.includes('artifacts') && (
        <Stat
          icon={<ArchiveIcon className="w-8 h-8" />}
          title={
            <Link to="./artifacts" prefetch="intent">
              Artifacts
            </Link>
          }
          value={user.artifacts.length}
          description={'Artifacts pushed by the user'}
        />
      )}
      {stats.includes('tokens') && (
        <Stat
          icon={<FingerPrintIcon className="w-8 h-8" />}
          title={
            <Link to="./tokens" prefetch="intent">
              Tokens
            </Link>
          }
          value={user.tokens.length}
        />
      )}
    </Stats>
  );
};

export default UserStats;
