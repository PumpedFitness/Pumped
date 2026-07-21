import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { OptionPopup } from '@/components/clay/option-popup';
import {
  type HomeMessageTone,
  useAppSettingsStore,
} from '@/stores/appSettingsStore';
import { colors } from '@/theme/tokens';

type HomeMessageProps = {
  name?: string | null;
};

export function HomeMessage({ name }: HomeMessageProps) {
  const { t } = useTranslation();
  const tone = useAppSettingsStore(state => state.homeMessageTone);
  const setTone = useAppSettingsStore(state => state.setHomeMessageTone);
  const [toneMenuOpen, setToneMenuOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(() => new Date().getDate());
  const messages = {
    supportive: [
      t('home.messages.supportive.first'),
      t('home.messages.supportive.second'),
      t('home.messages.supportive.third'),
      t('home.messages.supportive.fourth'),
    ],
    tough: [
      t('home.messages.tough.first'),
      t('home.messages.tough.second'),
      t('home.messages.tough.third'),
      t('home.messages.tough.fourth'),
    ],
    savage: [
      t('home.messages.savage.first'),
      t('home.messages.savage.second'),
      t('home.messages.savage.third'),
      t('home.messages.savage.fourth'),
    ],
  }[tone];
  const message = messages[messageIndex % messages.length];
  const toneEmoji = {
    supportive: '💪',
    tough: '😤',
    savage: '💀',
  } as const;
  const toneOptions: Array<{ value: HomeMessageTone; label: string }> = [
    { value: 'supportive', label: t('home.messageTones.supportive') },
    { value: 'tough', label: t('home.messageTones.tough') },
    { value: 'savage', label: t('home.messageTones.savage') },
  ];

  return (
    <View className="flex-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('settings.homeMessageTone')}
        onPress={() => setToneMenuOpen(true)}
        className="mb-1.5 self-start flex-row items-center gap-1.5 active:opacity-70"
      >
        <View className="h-5 w-5 items-center justify-center rounded-full bg-accent-soft">
          <Text className="text-[12px] leading-[16px]">{toneEmoji[tone]}</Text>
        </View>
        <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-accent">
          {t(`home.messageTones.${tone}`)}
        </Text>
        <ClayIcon name="chevron" size={12} color={colors.muted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.swapMessage')}
        onPress={() => setMessageIndex(index => index + 1)}
        className="active:opacity-70"
      >
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          className="h-[70px] text-[30px] font-bold leading-[35px] tracking-[-0.6px] text-foreground"
        >
          {message}
          {name ? `, ${name}` : ''}
        </Text>
      </Pressable>

      <OptionPopup
        visible={toneMenuOpen}
        title={t('settings.homeMessageTone')}
        text={t('home.tonePickerDescription')}
        options={toneOptions}
        selectedValue={tone}
        onClose={() => setToneMenuOpen(false)}
        onSelect={setTone}
      />
    </View>
  );
}
