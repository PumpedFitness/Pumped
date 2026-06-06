import { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { Card } from '../clay/Card';
import { colors, typography } from '../../theme/tokens';

type TimeWidgetProps = {
  colSpan: number;
  width: number;
};

function formatTime(date: Date): { time: string; period: string } {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const h12 = hours % 12 || 12;
  const period = hours < 12 ? 'AM' : 'PM';
  const time = `${h12}:${minutes.toString().padStart(2, '0')}`;
  return { time, period };
}

export function TimeWidget(_props: TimeWidgetProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { time, period } = formatTime(now);

  return (
    <Card variant="sunk" radius="lg" pad={15}>
      <Text
        style={{
          fontSize: typography.stat,
          fontWeight: '700',
          color: colors.ink,
          fontVariant: ['tabular-nums'],
          letterSpacing: -0.3,
        }}
      >
        {time}
      </Text>
      <Text
        style={{
          fontSize: typography.micro,
          fontWeight: '700',
          color: colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginTop: 2,
        }}
      >
        {period}
      </Text>
    </Card>
  );
}
