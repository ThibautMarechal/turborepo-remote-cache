import * as React from 'react';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import Stat from './Stat';
import Stats from './Stats';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import type { TeamDetail } from '~/types/prisma';
import HasRights from './HasRights';
import { isTeamOwner } from '~/roles/rights';

type Props = {
  sessions: number;
  artifacts: number;
  team: TeamDetail;
};

export const TeamStats = ({ team, sessions, artifacts }: Props) => {
  return (
    <Stats>
      <HasRights predicate={(u) => isTeamOwner(u, team.id)}>
        <Stat
          title="Sessions"
          icon={<BoltIcon className="w-8 h-8" />}
          value={sessions}
          description={'Number of "turbo run <command>"'}
          linkProps={{
            to: './sessions',
            prefetch: 'intent',
          }}
        />
        <Stat
          title="Artifacts"
          icon={<ArchiveBoxIcon className="w-8 h-8" />}
          value={artifacts}
          description={'Artifacts linked to the team'}
          linkProps={{
            to: './artifacts',
            prefetch: 'intent',
          }}
        />
      </HasRights>
      <Stat
        title="Users"
        icon={<UserGroupIcon className="w-8 h-8" />}
        value={team.members.length}
        description={'Users in the team'}
        linkProps={{
          to: './users',
          prefetch: 'intent',
        }}
      />
    </Stats>
  );
};

export default TeamStats;
