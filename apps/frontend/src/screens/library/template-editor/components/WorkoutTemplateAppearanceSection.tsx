import { Image, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import type { WorkoutTemplateColor } from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { IconPicker } from '@/components/forms/IconPicker';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { FormSection } from './FormSection';
import { useWorkoutColorOptions } from './useWorkoutColorOptions';
import { getWorkoutTemplateColor } from '@/components/workout/workoutTemplatePresentation';

type WorkoutTemplateAppearanceSectionProps = {
  color: WorkoutTemplateColor;
  icon: IconName | null;
  picture: string | null;
  onColorChange: (color: WorkoutTemplateColor) => void;
  onIconChange: (icon: IconName | null) => void;
  onPictureChange: (picture: string | null) => void;
};

export function WorkoutTemplateAppearanceSection({
  color,
  icon,
  picture,
  onColorChange,
  onIconChange,
  onPictureChange,
}: WorkoutTemplateAppearanceSectionProps) {
  const { t } = useTranslation();

  const colorOptions = useWorkoutColorOptions();
  const selectedColor = getWorkoutTemplateColor(color);

  const pickImage = () => {
    void (async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        onPictureChange(result.assets[0].uri);
      }
    })();
  };

  return (
    <>
      <FormSection title={t('templateEditor.appearance.logoTitle')}>
        <View className="flex-row items-center gap-4">
          <Pressable accessibilityRole="button" onPress={pickImage}>
            {picture ? (
              <Image
                source={{ uri: picture }}
                className="h-20 w-20 rounded-[20px]"
              />
            ) : (
              <View
                className="h-20 w-20 items-center justify-center rounded-[20px]"
                style={{ backgroundColor: selectedColor.hex }}
              >
                <ClayIcon
                  name={icon ?? 'dumbbell'}
                  size={30}
                  color={color === 'HONEY' ? colors.accentInk : colors.cream}
                />
              </View>
            )}
          </Pressable>
          <View className="flex-1 gap-1">
            <Pressable accessibilityRole="button" onPress={pickImage}>
              <Text className="t-label text-accent">
                {picture
                  ? t('templateEditor.appearance.changePhoto')
                  : t('templateEditor.appearance.addPhoto')}
              </Text>
            </Pressable>
            {picture ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onPictureChange(null)}
              >
                <Text className="t-caption text-muted">
                  {t('templateEditor.appearance.removePhoto')}
                </Text>
              </Pressable>
            ) : (
              <Text className="t-caption">
                {t('templateEditor.appearance.logoHint')}
              </Text>
            )}
          </View>
        </View>

        {!picture && (
          <IconPicker
            value={icon}
            onChange={next => onIconChange(next === icon ? null : next)}
          />
        )}
      </FormSection>

      <FormSection title={t('templateEditor.appearance.colorTitle')}>
        <ColorSwatchPicker
          value={color}
          options={colorOptions}
          onChange={onColorChange}
        />
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <Text className="t-caption">
            {t('templateEditor.appearance.colorHint', {
              color: t(selectedColor.labelKey),
            })}
          </Text>
        </View>
      </FormSection>
    </>
  );
}
