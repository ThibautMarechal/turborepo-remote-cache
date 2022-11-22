import { CleanPeriod } from './CleanPeriod';

export function getDateFromPeriod(period: CleanPeriod) {
  const date = new Date();
  switch (period) {
    case CleanPeriod.DAY:
      date.setDate(date.getDate() - 1);
      break;
    case CleanPeriod.WEEK:
      date.setDate(date.getDate() - 7);
      break;
    case CleanPeriod.MONTH:
      date.setMonth(date.getMonth() - 1);
      break;
    case CleanPeriod.YEAR:
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      throw new Error('Not reachable');
  }
  return date;
}
