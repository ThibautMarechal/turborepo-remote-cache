import * as React from 'react';
import ClockIcon from '@heroicons/react/outline/ClockIcon';
import { formatDuration, formatMonth } from '~/utils/intl';
import Stat from './Stat';
import Stats from './Stats';
import type { TimeSavedByMonth } from '~/services/events.server';
import type { UserSerie } from 'react-charts';
import { Chart } from 'react-charts';

type Props = {
  local: TimeSavedByMonth[];
  remote: TimeSavedByMonth[];
};

export const TimeSavedStats = ({ local, remote }: Props) => {
  const data: UserSerie<TimeSavedByMonth>[] = [
    {
      label: 'Remote',
      data: remote,
    },
    {
      label: 'Local',
      data: local,
    },
  ];

  return (
    <>
      <Stats>
        <Stat
          icon={<ClockIcon className="w-8 h-8" />}
          title="Time Saved locally"
          value={<div className="hover:fullturbo">{formatDuration(local.reduce((acc, { timeSaved }) => acc + timeSaved, 0))}</div>}
        />
        <Stat
          icon={<ClockIcon className="w-8 h-8" />}
          title="Time Saved remotly"
          value={<div className="hover:fullturbo">{formatDuration(remote.reduce((acc, { timeSaved }) => acc + timeSaved, 0))}</div>}
        />
      </Stats>
      <div className="w-full px-20 h-80 flex justify-center animate-appear">
        <div className="w-full">
          <Chart
            options={{
              initialWidth: 0,
              initialHeight: 0,
              data,
              primaryAxis: {
                getValue: ({ month, year }) => new Date(year, month - 1).toDateString(),
                formatters: {
                  cursor: (value: any) => formatMonth(value),
                  scale: (value: any) => formatMonth(value),
                  tooltip: (value: any) => formatMonth(value),
                },
                showGrid: false,
              },
              secondaryAxes: [
                {
                  getValue: ({ timeSaved }) => timeSaved,
                  formatters: {
                    cursor: (value: number) => formatDuration(value),
                    scale: (value: number) => formatDuration(value),
                    tooltip: (value: number) => formatDuration(value),
                  },
                  show: false,
                  showGrid: false,
                  elementType: 'bar',
                  stacked: true,
                },
              ],
              defaultColors: ['hsl(var(--p))', 'hsl(var(--pc))'],
              dark: true,
              primaryCursor: {
                showLine: false,
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TimeSavedStats;
