import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backAccessibilityLabel?: string;
  right?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  testID?: string;
};

/** Shared header for pages opened from another screen. */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backAccessibilityLabel,
  right,
  actionLabel,
  onAction,
  actionDisabled = false,
  testID = 'page-header',
}: ScreenHeaderProps) {
  const { t } = useTranslation();
  return (
    <View testID={testID} className="bg-background">
      <View className="min-h-14 flex-row items-center gap-2 px-4">
        <Pressable
          testID={`${testID}-back`}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel ?? t('common.back')}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-card"
          onPress={onBack}
        >
          <ClayIcon name="back" size={20} color={colors.ink} />
        </Pressable>
        <Text
          accessibilityRole="header"
          className="t-title min-w-0 flex-1"
          numberOfLines={1}
        >
          {title}
        </Text>
        {actionLabel && onAction ? (
          <Pressable
            testID={`${testID}-action`}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            accessibilityState={{ disabled: actionDisabled }}
            disabled={actionDisabled}
            className="min-h-11 shrink-0 items-end justify-center px-2 active:opacity-60"
            onPress={onAction}
          >
            <Text
              className={
                actionDisabled ? 't-label text-muted' : 't-label text-accent'
              }
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : (
          right
        )}
      </View>
      {subtitle ? (
        <Text className="t-caption px-5 pb-3 pt-1">{subtitle}</Text>
      ) : null}
    </View>
  );
}
