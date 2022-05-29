import * as React from 'react';
import ClockIcon from '@heroicons/react/outline/ClockIcon';
import { formatDuration } from '~/utils/intl';
import Stat from './Stat';
import Stats from './Stats';

type Props = {
  local?: number;
  remote?: number;
};

export const TimeSavedStats = ({ local = 0, remote = 0 }: Props) => {
  return (
    <Stats>
      <Stat icon={<ClockIcon className="w-8 h-8" />} title="Time Saved locally" value={<div className="hover:fullturbo">{formatDuration(local)}</div>} />
      <Stat icon={<ClockIcon className="w-8 h-8" />} title="Time Saved remotly" value={<div className="hover:fullturbo">{formatDuration(remote)}</div>} />
    </Stats>
  );
};

export default TimeSavedStats;
