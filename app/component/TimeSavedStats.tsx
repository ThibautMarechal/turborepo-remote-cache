import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import { formatDuration, formatMonth } from '~/utils/intl';
import Stat from './Stat';
import Stats from './Stats';
import type { TimeSavedByMonth } from '~/services/events.server';
import type { UserSerie } from 'react-charts';
import React, { Fragment, Suspense } from 'react';

const LazyChart = React.lazy(() => import('react-charts').then(({ Chart }) => ({ default: Chart })));

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
  const totalLocal = local.reduce((acc, { timeSaved }) => acc + timeSaved, 0);
  const totalRemote = remote.reduce((acc, { timeSaved }) => acc + timeSaved, 0);
  return (
    <>
      <Stats>
        <Stat icon={<ClockIcon className="w-8 h-8" />} title="Time Saved locally" value={<div className="hover:fullturbo">{formatDuration(totalLocal)}</div>} />
        <Stat icon={<ClockIcon className="w-8 h-8" />} title="Time Saved remotly" value={<div className="hover:fullturbo">{formatDuration(totalRemote)}</div>} />
      </Stats>
      {(totalRemote > 0 || totalLocal > 0) && (
        <div className="w-full px-20 h-80 flex justify-center animate-appear">
          <div className="w-full">
            <Suspense fallback={<Fragment />}>
              <LazyChart
                options={{
                  data,
                  primaryAxis: {
                    getValue: ({ month, year }: any) => new Date(year, month - 1).toISOString(),
                    formatters: {
                      cursor: (time: any) => formatMonth(time),
                      scale: (time: any) => formatMonth(time),
                      tooltip: (time: any) => formatMonth(time),
                    },
                    padBandRange: true,
                  },
                  secondaryAxes: [
                    {
                      getValue: ({ timeSaved }: any) => timeSaved,
                      formatters: {
                        cursor: (value: number) => formatDuration(value),
                        scale: (value: number) => formatDuration(value),
                        tooltip: (value: number) => formatDuration(value),
                      },
                      elementType: 'bar',
                      show: false,
                      min: 0,
                      stacked: true,
                    },
                  ],
                  defaultColors: ['hsl(var(--p))', 'hsl(var(--pc))'],
                  dark: true,
                  primaryCursor: {
                    showLine: false,
                  },
                  tooltip: {
                    show: false,
                  },
                }}
              />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
};

export default TimeSavedStats;
