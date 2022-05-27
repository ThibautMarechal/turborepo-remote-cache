import * as React from 'react';

type Props = {
  children: React.ReactNode;
};

export const Stats = ({ children }: Props) => {
  return <div className="stats shadow">{children}</div>;
};

export default Stats;
