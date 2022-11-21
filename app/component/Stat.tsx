import * as React from 'react';
import { Link } from '@remix-run/react';
import type { RemixLinkProps } from '@remix-run/react/dist/components';

type Props = {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  linkProps?: RemixLinkProps;
};

export const Stat = ({ icon, title, value, description, linkProps }: Props) => {
  const content = (
    <>
      <div className="stat-figure text-primary">{icon}</div>
      <div className="stat-title text-secondary-content">{title}</div>
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
