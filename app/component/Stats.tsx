import * as React from 'react';

type Props = {
  children: React.ReactNode;
};

export const Stats = ({ children }: Props) => {
  return <div className="stats stats-vertical lg:stats-horizontal shadow">{children}</div>;
};

export default Stats;
