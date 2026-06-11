import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { PopupTestButtons } from '../../components/home/PopupTestButtons';
import { WidgetGrid } from '../../components/widgets/WidgetGrid';
import { useHomescreenStore } from '../../stores/homescreenStore';
import { colors, typography } from '../../theme/tokens';

function getGreeting(): { timeLabel: string; greeting: string } {
  const hour = new Date().getHours();
  let timeLabel: string;
  if (hour < 12) timeLabel = 'morning';
  else if (hour < 17) timeLabel = 'afternoon';
  else timeLabel = 'evening';

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayName = days[new Date().getDay()];

  return {
    timeLabel: `${dayName} ${timeLabel}`,
    greeting: "Let's move, Alex",
  };
}

export function HomeScreen() {
  const layout = useHomescreenStore(s => s.layout);
  const initialize = useHomescreenStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const { timeLabel, greeting } = getGreeting();

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: typography.caption,
              color: colors.muted,
              fontWeight: '500',
              marginBottom: 4,
            }}
          >
            {timeLabel}
          </Text>
          <Text
            style={{
              fontSize: typography.display,
              fontWeight: '700',
              color: colors.ink,
              letterSpacing: -0.5,
            }}
          >
            {greeting}
          </Text>
        </View>

        {/* Widget Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          <PopupTestButtons />
          <WidgetGrid layout={layout} />
        </View>
      </ScrollView>
    </AppShell>
  );
}
