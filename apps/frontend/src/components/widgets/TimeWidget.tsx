import { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';

type TimeWidgetProps = {
  colSpan: number;
  width: number;
};

function formatTime(
  date: Date,
  language: string,
): { time: string; period: string } {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const h12 = hours % 12 || 12;
  const time = `${h12}:${minutes.toString().padStart(2, '0')}`;
  // Localized day period (e.g. "AM"/"PM") — strip digits and separators
  // from the locale-formatted time so only the period label remains.
  const period =
    date
      .toLocaleTimeString(language, { hour: 'numeric', hour12: true })
      .replace(/[\d:\s\u202f]/g, '') || (hours < 12 ? 'AM' : 'PM');
  return { time, period };
}

export function TimeWidget(_props: TimeWidgetProps) {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { time, period } = formatTime(now, i18n.language);

  return (
    <Card variant="sunk" radius="lg" pad={15}>
      <Text className="text-[28px] font-bold text-foreground tabular-nums tracking-[-0.3px]">
        {time}
      </Text>
      <Text className="text-[11px] font-bold text-muted uppercase tracking-[1.2px] mt-[2px]">
        {period}
      </Text>
    </Card>
  );
}
