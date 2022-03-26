const locale = 'en-gb';
const timeFormatter = new Intl.RelativeTimeFormat(locale, { style: 'long', numeric: 'always', localeMatcher: 'lookup' });

export function formatDuration(durationMs: number) {
  const seconds = durationMs / 1000;
  if (seconds < 60) {
    return timeFormatter.format(Math.floor(seconds), 'seconds').replace(/^[^\d]*/, '');
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    return timeFormatter.format(Math.floor(minutes), 'minutes').replace(/^[^\d]*/, '');
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return timeFormatter.format(Math.floor(hours), 'hours').replace(/^[^\d]*/, '');
  }
  const days = hours / 24;
  return timeFormatter.format(Math.floor(days), 'days').replace(/^[^\d]*/, '');
}

const dateFormmatter = Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' });
export function formatDate(date: string) {
  return dateFormmatter.format(new Date(date));
}
