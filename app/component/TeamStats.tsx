import * as React from 'react';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import { Link } from '@remix-run/react';
import Stat from './Stat';
import Stats from './Stats';
import UserGroupIcon from '@heroicons/react/outline/UserGroupIcon';
import type { TeamDetail } from '~/types/prisma';
import HasRights from './HasRights';
import { requireTeamOwner } from '~/roles/rights';

type Props = {
  sessions: number;
  artifacts: number;
  team: TeamDetail;
};

export const TeamStats = ({ team, sessions, artifacts }: Props) => {
  return (
    <Stats>
      <HasRights predicate={(u) => requireTeamOwner(u, team.id)}>
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
      </HasRights>
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
  );
};

export default TeamStats;
