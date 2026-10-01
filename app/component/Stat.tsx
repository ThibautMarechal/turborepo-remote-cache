import * as React from 'react';
import { Link } from 'react-router';
import type { LinkProps } from 'react-router';

type Props = {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  linkProps?: LinkProps;
};

export const Stat = ({ icon, title, value, description, linkProps }: Props) => {
  const content = (
    <>
      <div className="stat-figure text-primary">{icon}</div>
      <div className="stat-title text-base">{title}</div>
      <div className="stat-value">{value}</div>
      {description ? <div className="stat-desc">{description}</div> : null}
    </>
  );
  return linkProps ? (
    <Link {...linkProps} className="stat">
      {content}
    </Link>
  ) : (
    <div className="stat">{content}</div>
  );
};

export default Stat;
