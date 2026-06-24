/**
 * Tiny class-name joiner. Filters falsy values and joins with a space.
 * Keeps component markup readable without pulling in a dependency.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ReadonlyArray<ClassValue>): string {
  return values.filter(Boolean).join(' ');
}
