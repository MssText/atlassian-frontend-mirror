import { createLocalizationProvider } from '@atlaskit/locale';
import { DateType } from '../types';

/**
 * Attempt to parse a string representing a date in a particular locale to a date object
 * @param dateString The string representing the date in the given locale, eg '02/12/2000'
 * @param l10n The localisation provider created by createLocalizationProvider
 * @returns Date when can parse, undefined when can't parse
 */
export function parseDateType(
  dateString: string,
  locale: string,
): DateType | undefined {
  try {
    const l10n = createLocalizationProvider(locale);
    const date = l10n.parseDate(dateString);

    // If date is invalid
    if (isNaN(date.getTime())) {
      return undefined;
    }

    const dateObj = {
      // day: date.getUTCDate(),
      // month: date.getUTCMonth() + 1,
      // year: date.getUTCFullYear(),
      day: date.getDate(), // toDate() called by parseDate() doesn't use UTC, so can't use here
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
    return dateObj;
  } catch (e) {
    return undefined;
  }
}

/**
 * Convert a date object to a string formatted for a particular locale
 * @param date The date object
 * @param l10n The localisation provider created by createLocalizationProvider
 */
export function formatDateType(date: DateType, locale: string): string {
  const { day, month, year } = date;
  const l10n = createLocalizationProvider(locale);

  // Range of month is 0-11!
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  const dateObj = new Date(Date.UTC(year, month - 1, day));

  // const date = parse(value);
  return l10n.formatDate(dateObj);
}
export function dateTypeToDate(date: DateType): Date {
  const { day, month, year } = date;
  // Range of month is 0-11!
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return dateObj;
}
export function dateToDateType(date: Date): DateType {
  const dateObj = {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
  return dateObj;
}
