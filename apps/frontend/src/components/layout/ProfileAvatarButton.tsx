import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * Der Zugang zum Profil, rechts in jeder Kopfzeile.
 *
 * Sitzt bewusst nicht in der Tab-Leiste: Fünf Ziele sind das Maximum, ab dem
 * sechsten versteckt iOS zwei hinter „More". Das Profil ist ein Ort, den man
 * gezielt aufsucht, kein Ziel, zwischen dem man hin- und herwechselt — die
 * Ecke oben rechts ist dafür die etabliertere Stelle.
 */
export function ProfileAvatarButton() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useUserProfile();

  const initial = profile.name.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => navigation.navigate('Profile')}
      accessibilityRole="button"
      accessibilityLabel={t('tabs.user')}
      testID="profile_avatar"
      className="w-11 h-11 rounded-full items-center justify-center border border-border-hairline bg-surface-card active:opacity-70"
    >
      {initial === '' ? (
        <ClayIcon name="user" size={20} color={colors.muted} />
      ) : (
        <Text className="text-[17px] font-bold text-foreground">{initial}</Text>
      )}
    </Pressable>
  );
}
