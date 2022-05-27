import * as React from 'react';
import { formatDate, formatRelativeDate } from '~/utils/intl';

type Props = {
  date: string | Date;
  locale?: string;
};

export const DateCell = ({ date }: Props) => {
  return <div title={formatDate(date)}>{formatRelativeDate(date)}</div>;
};

export default DateCell;
