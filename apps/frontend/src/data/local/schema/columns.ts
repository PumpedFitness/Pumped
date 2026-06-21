import { customType } from 'drizzle-orm/sqlite-core';

/** Text column that auto-parses/serializes a JSON array. */
export const jsonArray = <T>() =>
  customType<{ data: T[]; driverData: string }>({
    dataType: () => 'text',
    toDriver: (value: T[]) => JSON.stringify(value),
    fromDriver: (value: string) => JSON.parse(value) as T[],
  });

/** Text column that auto-parses/serializes a single JSON object. */
export const jsonObject = <T>() =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'text',
    toDriver: (value: T) => JSON.stringify(value),
    fromDriver: (value: string) => JSON.parse(value) as T,
  });

/** Text column narrowed to a string union (enum). */
export const enumText = <T extends string>() =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'text',
    toDriver: (value: T) => value,
    fromDriver: (value: string) => value as T,
  });
