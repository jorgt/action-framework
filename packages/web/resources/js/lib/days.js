// 146097 days in 400 years (moment.js:daysToMonths()):
const DAYS_PER_MONTH = 146097 / 400 / 12;

/**
 * Returns val, rounded if it is less than the threshold, otherwise
 * it returns a tombstone value (0).
 */
const thresh = (threshold, val) => {
  const valRounded = Math.round(val);
  return valRounded < threshold ? valRounded : 0;
};
const pluralize = (n, word) => (n === 1 ? word : `${word}s`);
const makeHumanizedString = (n, singularUnit, ago) => `${n} ${pluralize(n, singularUnit)}${ago ? ' ago' : ''}`;

const SECONDS_MS = 1000;
const MINUTES_MS = 60 * SECONDS_MS;
const HOURS_MS = 60 * MINUTES_MS;
const DAYS_MS = 24 * HOURS_MS;
const MONTHS_MS = DAYS_PER_MONTH * DAYS_MS;
const YEARS_MS = 365 * DAYS_MS;

function humanize(durationMs) {
  const ago = durationMs < 0;
  const absDurationMs = Math.abs(durationMs);

  let n = thresh(45, absDurationMs / SECONDS_MS);
  if (n !== 0) return makeHumanizedString(n, 'second', ago);

  n = thresh(45, absDurationMs / MINUTES_MS);
  if (n !== 0) return makeHumanizedString(n, 'minute', ago);

  n = thresh(22, absDurationMs / HOURS_MS);
  if (n !== 0) return makeHumanizedString(n, 'hour', ago);

  n = thresh(26, absDurationMs / DAYS_MS);
  if (n !== 0) return makeHumanizedString(n, 'day', ago);

  n = thresh(11, absDurationMs / MONTHS_MS);
  if (n !== 0) return makeHumanizedString(n, 'month', ago);

  n = thresh(Number.MAX_VALUE, absDurationMs / YEARS_MS);
  if (n !== 0) return makeHumanizedString(n, 'year', ago);

  return 'now';
}

function fromNowFn(from, to = new Date()) {
  const normalizedFrom = from instanceof Date ? from.getTime() : from;
  const normalizedTo = to instanceof Date ? to.getTime() : to;
  return humanize(normalizedFrom - normalizedTo);
}

export const fromNow = Object.assign(fromNowFn, { humanize });

export function getStartOfWeek(date) {
  // Create a new Date object at the start of the given day
  const resultDate = new Date(date);
  const day = resultDate.getUTCDay(); // Get the day of the week (0 is Sunday)

  // Calculate the start of the week (Sunday)
  const diff = resultDate.getUTCDate() - day; // Adjust the date back to Sunday
  resultDate.setUTCDate(diff);
  resultDate.setUTCHours(0, 0, 0, 0);

  return resultDate;
}

export const formatToPostgresDate = date => date.toISOString().split('T')[0];

export function subtractDays(date, days) {
  const resultDate = new Date(date);
  resultDate.setDate(resultDate.getDate() - days);

  return resultDate;
}
