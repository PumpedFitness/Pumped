import { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { WheelPicker } from './WheelPicker';

type DateTimeWheelPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
};

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function DateTimeWheelPicker({
  value,
  onChange,
  maximumDate,
}: DateTimeWheelPickerProps) {
  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();
  const hour = value.getHours();
  const minute = value.getMinutes();

  const numDays = daysInMonth(year, month);
  const days = useMemo(() => {
    const arr: string[] = [];
    for (let d = 1; d <= numDays; d++) arr.push(String(d));
    return arr;
  }, [numDays]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad(i)), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => pad(i)), []);

  const clamp = useCallback(
    (d: Date): Date => {
      if (maximumDate && d > maximumDate) return new Date(maximumDate);
      return d;
    },
    [maximumDate],
  );

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
      <WheelPicker
        items={MONTHS_SHORT}
        selectedIndex={month}
        onChange={i => {
          const maxD = daysInMonth(year, i);
          onChange(clamp(new Date(year, i, Math.min(day, maxD), hour, minute)));
        }}
        width={58}
      />
      <WheelPicker
        items={days}
        selectedIndex={Math.min(day - 1, numDays - 1)}
        onChange={i => onChange(clamp(new Date(year, month, i + 1, hour, minute)))}
        width={40}
      />
      <WheelPicker
        items={hours}
        selectedIndex={hour}
        onChange={i => onChange(clamp(new Date(year, month, day, i, minute)))}
        width={44}
      />
      <WheelPicker
        items={minutes}
        selectedIndex={minute}
        onChange={i => onChange(clamp(new Date(year, month, day, hour, i)))}
        width={44}
      />
    </View>
  );
}
