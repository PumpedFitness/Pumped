export function uniqueBy<T, K>(values: T[], getKey: (value: T) => K): T[] {
  const seen = new Set<K>();

  return values.filter(value => {
    const key = getKey(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function uniqueStrings(values: string[]): string[] {
  return uniqueBy(values, value => value);
}
