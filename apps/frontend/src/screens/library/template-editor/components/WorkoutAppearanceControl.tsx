import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import type { WorkoutTemplateColor } from '@/data/local/enums';
import { getWorkoutTemplateColor } from '@/components/workout/workoutTemplatePresentation';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon, type IconName } from '@pumped/ui/icons/ClayIcon';
import { IconPicker } from '@pumped/ui/forms/IconPicker';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { useWorkoutColorOptions } from './useWorkoutColorOptions';

type WorkoutAppearanceControlProps = {
  color: WorkoutTemplateColor;
  icon: IconName | null;
  picture: string | null;
  onColorChange: (color: WorkoutTemplateColor) => void;
  onIconChange: (icon: IconName | null) => void;
  onPictureChange: (picture: string | null) => void;
};

type AppearancePopupProps = WorkoutAppearanceControlProps & {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
};

function AppearancePopup({
  visible,
  color,
  icon,
  picture,
  onClose,
  onPickImage,
  onColorChange,
  onIconChange,
  onPictureChange,
}: AppearancePopupProps) {
  const { t } = useTranslation();
  const colorOptions = useWorkoutColorOptions();
  const selectedColor = getWorkoutTemplateColor(color);
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityViewIsModal
        className="flex-1 items-center justify-center px-5 py-10"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.closePopup')}
          className="absolute inset-0 bg-black/60"
          onPress={onClose}
        />
        <View className="max-h-full w-full max-w-md overflow-hidden rounded-[28px] border border-border-hairline bg-background">
          <ScrollView
            contentContainerClassName="gap-5 px-5 py-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row items-center justify-between">
              <Text className="t-title">
                {t('templateEditor.appearance.title')}
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-surface-sunk"
                onPress={onClose}
              >
                <ClayIcon name="x" size={15} color={colors.ink2} />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-3">
              {picture ? (
                <Image
                  source={{ uri: picture }}
                  className="h-14 w-14 rounded-[16px]"
                />
              ) : (
                <View
                  className="h-14 w-14 items-center justify-center rounded-[16px]"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <ClayIcon
                    name={icon ?? 'dumbbell'}
                    size={23}
                    color={color === 'HONEY' ? colors.accentInk : colors.cream}
                  />
                </View>
              )}
              <View className="flex-1 flex-row flex-wrap gap-2">
                <Pressable
                  accessibilityRole="button"
                  className="rounded-full bg-accent-soft px-4 py-2"
                  onPress={onPickImage}
                >
                  <Text className="t-label text-accent">
                    {picture
                      ? t('templateEditor.appearance.changePhoto')
                      : t('templateEditor.appearance.addPhoto')}
                  </Text>
                </Pressable>
                {picture ? (
                  <Pressable
                    accessibilityRole="button"
                    className="rounded-full bg-surface-sunk px-4 py-2"
                    onPress={() => onPictureChange(null)}
                  >
                    <Text className="t-label text-muted">
                      {t('templateEditor.appearance.removePhoto')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View className="gap-2">
              <Text className="t-eyebrow">
                {t('templateEditor.appearance.colorTitle')}
              </Text>
              <ColorSwatchPicker
                compact
                value={color}
                options={colorOptions}
                onChange={onColorChange}
              />
            </View>

            {!picture ? (
              <View className="gap-2">
                <Text className="t-eyebrow">
                  {t('templateEditor.appearance.iconTitle')}
                </Text>
                <IconPicker
                  value={icon}
                  onChange={next => onIconChange(next === icon ? null : next)}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function WorkoutAppearanceControl({
  color,
  icon,
  picture,
  onColorChange,
  onIconChange,
  onPictureChange,
}: WorkoutAppearanceControlProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('templateEditor.appearance.editA11y')}
        className="h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[18px] border border-border-hairline bg-surface-card active:bg-surface-sunk"
        onPress={() => setOpen(true)}
      >
        {picture ? (
          <Image source={{ uri: picture }} className="h-full w-full" />
        ) : (
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: selectedColor.hex }}
          >
            <ClayIcon
              name={icon ?? 'dumbbell'}
              size={18}
              color={color === 'HONEY' ? colors.accentInk : colors.cream}
            />
          </View>
        )}
        {picture ? (
          <View
            className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-surface-card"
            style={{ backgroundColor: selectedColor.hex }}
          />
        ) : null}
      </Pressable>

      <AppearancePopup
        visible={open}
        color={color}
        icon={icon}
        picture={picture}
        onClose={() => setOpen(false)}
        onPickImage={pickImage}
        onColorChange={onColorChange}
        onIconChange={onIconChange}
        onPictureChange={onPictureChange}
      />
    </>
  );
}
