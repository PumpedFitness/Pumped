import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { ClayIcon, type IconName } from '../icons/ClayIcon';
import { colors, shadows } from '../theme/tokens';

type Tab = {
  key: string;
  label: string;
  icon: IconName;
};

type FloatingTabBarProps = {
  tabs: Tab[];
  activeKey: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
  className?: string;
};

export function FloatingTabBar({
  tabs,
  activeKey,
  onSelect,
  style,
  className = '',
}: FloatingTabBarProps) {
  return (
    <View
      className={`flex-row gap-[2px] rounded-full bg-moss p-[7px] ${className}`}
      style={[shadows.nav, style]}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onSelect(tab.key)}
            className={`flex-row items-center justify-center gap-[8px] rounded-full py-[6px] px-[13px] ${
              active ? 'flex-none bg-[#F4F2EF]' : 'flex-1'
            }`}
          >
            <ClayIcon
              name={tab.icon}
              size={17}
              stroke={1.8}
              color={active ? colors.ink : 'rgba(244,242,239,0.62)'}
            />
            {active ? (
              <Text
                numberOfLines={1}
                className="text-[12px] font-[700] text-foreground"
              >
                {tab.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
