export function formatSize(contentLength: number) {
  const size = Math.abs(contentLength);

  if (Number.isNaN(size)) {
    return 'Invalid file size';
  }

  if (size === 0) {
    return '0 B';
  }

  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${Number((size / Math.pow(1024, i)).toFixed(2))} ${['B', 'kB', 'MB', 'GB', 'TB', 'PB'][i]}`;
}

export function formatDuration(seconds: number, locale = 'en-gb') {
  const timeFormatter = new Intl.RelativeTimeFormat(locale);
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

export function formatDate(date: string | number | Date, locale = 'en-gb') {
  const dateFormmatter = Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' });
  return dateFormmatter.format(new Date(date));
}

export function formatMonth(date: string | number | Date, locale = 'en-gb') {
  const dateFormmatter = Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const dateParts = dateFormmatter.formatToParts(new Date(date));
  const month = dateParts.find((part) => part.type === 'month')?.value;
  const year = dateParts.find((part) => part.type === 'year')?.value;
  return `${month} ${year}`;
}

export function formatRelativeDate(date: string | number | Date, locale = 'en-gb') {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diff / 1000);
  const relativeTimeFormatter = new Intl.RelativeTimeFormat(locale);
  if (diffSeconds < 60) {
    return relativeTimeFormatter.format(-diffSeconds, 'seconds');
  }
  const diffMinutes = Math.floor(diff / (1000 * 60));
  if (diffMinutes < 60) {
    return relativeTimeFormatter.format(-diffMinutes, 'minutes');
  }
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  if (diffHours < 24) {
    return relativeTimeFormatter.format(-diffHours, 'hours');
  }
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return relativeTimeFormatter.format(-diffDays, 'days');
  }
  if (diffDays < 365) {
    return relativeTimeFormatter.format(-Math.floor(diffDays / 7), 'weeks');
  }
  return relativeTimeFormatter.format(-Math.floor(diffDays / 365), 'years');
}
