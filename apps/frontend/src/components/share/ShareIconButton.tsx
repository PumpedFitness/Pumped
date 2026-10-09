import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

type ShareIconButtonProps = {
  onPress: () => void;
  /** Icon tint; defaults to ink. */
  color?: string;
  size?: number;
  /** Defaults to a plain "Share". */
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * The share trigger used across the app. The icon set has no share glyph;
 * an upward arrow reads as "send out" next to the platform share sheet.
 */
export function ShareIconButton({
  onPress,
  color = colors.ink,
  size = 18,
  accessibilityLabel,
  testID,
}: ShareIconButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('share.send.a11y')}
      className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
      testID={testID}
    >
      <ClayIcon name="arrowUp" size={size} color={color} />
    </Pressable>
  );
}
