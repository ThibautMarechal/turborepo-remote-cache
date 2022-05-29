import * as React from 'react';

type Props = {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
};

export const Stat = ({ icon, title, value, description }: Props) => {
  return (
    <div className="stat">
      <div className="stat-figure text-primary">{icon}</div>
      <div className="stat-title text-secondary-content">{title}</div>
      <div className="stat-value">{value}</div>
      {description ? <div className="stat-desc">{description}</div> : null}
    </div>
  );
};

export default Stat;
