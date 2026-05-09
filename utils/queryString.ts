/**
 * utils/queryString.ts
 * Builds a URL query string from a filters object, skipping undefined/null values.
 */

export const buildQueryString = (
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return "";

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  if (entries.length === 0) return "";

  const qs = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  return `?${qs}`;
};
