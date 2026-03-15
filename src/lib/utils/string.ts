/**
 * Normalizes a string by trimming whitespace, converting to lowercase,
 * and removing diacritics (accents, tildes, etc.).
 *
 * @param str The string to normalize
 * @returns The normalized string
 */
export function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
