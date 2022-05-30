export function formatSize(contentLength: number) {
  let size = Math.abs(contentLength);

  if (Number.isNaN(size)) {
    return 'Invalid file size';
  }

  if (size === 0) {
    return '0 bytes';
  }

  const units = ['bytes', 'kB', 'MB', 'GB', 'TB'];
  let quotient = Math.floor(Math.log10(size) / 3);
  quotient = quotient < units.length ? quotient : units.length - 1;
  size /= 1000 ** quotient;

  return `${Number(size.toFixed(2))} ${units[quotient]}`;
}

export function formatDuration(durationMs: number, locale = 'en-gb', long: boolean = false) {
  const timeFormatter = new Intl.RelativeTimeFormat(locale);
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

export function formatDate(date: string | Date, locale = 'en-gb') {
  const dateFormmatter = Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' });
  return dateFormmatter.format(new Date(date));
}

export function formatMonth(date: string | Date, locale = 'en-gb') {
  const dateFormmatter = Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const dateParts = dateFormmatter.formatToParts(new Date(date));
  const month = dateParts.find((part) => part.type === 'month')?.value;
  const year = dateParts.find((part) => part.type === 'year')?.value;
  return `${month} ${year}`;
}

export function formatRelativeDate(date: string | Date, locale = 'en-gb') {
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
