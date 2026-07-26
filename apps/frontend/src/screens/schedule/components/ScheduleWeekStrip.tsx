import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';
import type { WeekDay } from './scheduleWeekModel';

const MS_PER_DAY = 86_400_000;
const AVATAR_SIZE = 34;

type ScheduleWeekStripProps = {
  days: WeekDay[];
};

// A status badge pinned to the avatar's corner: a check for completed days, a
// skip glyph for skipped ones. Planned/rest days carry none.
function StatusBadge({ status }: { status: WeekDay['status'] }) {
  if (status === 'done') {
    return (
      <View className="absolute -bottom-0.5 -right-0.5 h-[15px] w-[15px] items-center justify-center rounded-full border border-surface-card bg-moss">
        <ClayIcon name="check" size={9} color={colors.cream} />
      </View>
    );
  }
  if (status === 'skipped') {
    return (
      <View className="absolute -bottom-0.5 -right-0.5 h-[15px] w-[15px] items-center justify-center rounded-full border border-surface-card bg-surface-sunk">
        <ClayIcon name="skip" size={9} color={colors.muted} />
      </View>
    );
  }
  return null;
}

function DayMark({ day }: { day: WeekDay }) {
  const first = day.templates[0];
  const extra = day.templates.length - 1;

  if (!first) {
    // Rest day (or an empty future day): a quiet hollow dot.
    return (
      <View className="h-[34px] w-[34px] items-center justify-center">
        <View
          className={`h-2 w-2 rounded-full ${
            day.status === 'done' ? 'bg-moss' : 'bg-[#D7D4CF]'
          }`}
        />
        <StatusBadge status={day.status} />
      </View>
    );
  }

  return (
    <View
      className={day.status === 'skipped' ? 'opacity-45' : undefined}
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
    >
      <WorkoutAvatar
        picture={first.picture}
        icon={first.icon}
        color={first.color}
        size={AVATAR_SIZE}
      />
      {extra > 0 && (
        <View className="absolute -right-1 -top-1 h-[15px] min-w-[15px] items-center justify-center rounded-full border border-surface-card bg-foreground px-1">
          <Text className="text-[9px] font-bold text-background">+{extra}</Text>
        </View>
      )}
      <StatusBadge status={day.status} />
    </View>
  );
}

function DayCell({ day }: { day: WeekDay }) {
  const { i18n } = useTranslation();
  const date = new Date(day.dayIndex * MS_PER_DAY);
  const letter = date.toLocaleDateString(i18n.language, {
    weekday: 'narrow',
    timeZone: 'UTC',
  });
  const dayOfMonth = date.getUTCDate();
  // Past, unfulfilled days recede so the eye lands on today and what's ahead.
  const dim = day.isPast && day.status !== 'done';

  return (
    <View
      className={`flex-1 items-center gap-1.5 rounded-[18px] py-2 ${
        day.isToday ? 'border border-accent bg-accent-soft' : ''
      }`}
    >
      <Text
        className={`t-eyebrow ${day.isToday ? 'text-accent' : 'text-muted'}`}
      >
        {letter}
      </Text>
      <View className={dim ? 'opacity-40' : undefined}>
        <DayMark day={day} />
      </View>
      <Text
        className={`text-[11px] font-semibold ${
          day.isToday ? 'text-accent' : 'text-foreground-secondary'
        }`}
      >
        {dayOfMonth}
      </Text>
    </View>
  );
}

export function ScheduleWeekStrip({ days }: ScheduleWeekStripProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      <Text className="t-eyebrow text-muted">{t('schedule.week.title')}</Text>
      <View
        className="flex-row gap-1 rounded-[24px] bg-surface-card p-2"
        style={shadows.card}
      >
        {days.map(day => (
          <DayCell key={day.dayIndex} day={day} />
        ))}
      </View>
    </View>
  );
}
