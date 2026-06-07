import { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { WheelPicker } from './WheelPicker';

type DateWheelPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DateWheelPicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateWheelPickerProps) {
  const minYear = minimumDate?.getFullYear() ?? 1900;
  const maxYear = maximumDate?.getFullYear() ?? new Date().getFullYear();

  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = minYear; y <= maxYear; y++) arr.push(String(y));
    return arr;
  }, [minYear, maxYear]);

  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();

  const numDays = daysInMonth(year, month);
  const days = useMemo(() => {
    const arr: string[] = [];
    for (let d = 1; d <= numDays; d++) arr.push(String(d));
    return arr;
  }, [numDays]);

  const clampDate = useCallback(
    (y: number, m: number, d: number): Date => {
      const maxD = daysInMonth(y, m);
      const clamped = new Date(y, m, Math.min(d, maxD));
      if (minimumDate && clamped < minimumDate) return minimumDate;
      if (maximumDate && clamped > maximumDate) return maximumDate;
      return clamped;
    },
    [minimumDate, maximumDate],
  );

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      <WheelPicker
        items={MONTHS}
        selectedIndex={month}
        onChange={i => onChange(clampDate(year, i, day))}
        width={70}
      />
      <WheelPicker
        items={days}
        selectedIndex={Math.min(day - 1, numDays - 1)}
        onChange={i => onChange(clampDate(year, month, i + 1))}
        width={50}
      />
      <WheelPicker
        items={years}
        selectedIndex={year - minYear}
        onChange={i => onChange(clampDate(minYear + i, month, day))}
        width={70}
      />
    </View>
  );
}
