import { Link, useLoaderData, type LoaderFunction } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import omit from 'lodash/omit';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { getTeamDetail } from '~/services/teams.server';
import Stats from '~/component/Stats';
import Stat from '~/component/Stat';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import LightningBoltIcon from '@heroicons/react/outline/LightningBoltIcon';
import UserGroupIcon from '@heroicons/react/outline/UserGroupIcon';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const user = await getTeamDetail(params.id as string);
  return omit(user, 'passwordHash');
};

export default function Team() {
  const team = useLoaderData<Awaited<ReturnType<typeof getTeamDetail>>>();
  return (
    <div className="flex flex-wrap justify-center gap-2 m-2">
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
          value={team.sessions.length}
          description={'Number of "turbo run <command>"'}
        />
        <Stat
          title={
            <Link to="./artifacts" prefetch="intent">
              Artifacts
            </Link>
          }
          icon={<ArchiveIcon className="w-8 h-8" />}
          value={team.artifacts.length}
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
    </div>
  );
}
