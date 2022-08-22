import DatabaseIcon from '@heroicons/react/outline/DatabaseIcon';
import { formatSize } from '~/utils/intl';
import Stat from './Stat';
import Stats from './Stats';

type Props = {
  size: number;
};

export const StorageStats = ({ size }: Props) => {
  return (
    <>
      <Stats>
        <Stat icon={<DatabaseIcon className="w-8 h-8" />} title="Artifacts size" value={formatSize(size)} description={'Total size of the cached artifacts'} />
      </Stats>
    </>
  );
};

export default StorageStats;
