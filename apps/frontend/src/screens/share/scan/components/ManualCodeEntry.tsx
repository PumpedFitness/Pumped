import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@pumped/ui/clay/Button';
import { colors, shadows } from '@pumped/ui/theme/tokens';
import { parseShareCode } from '@/lib/share/shareLink';

type ManualCodeEntryProps = {
  onCode: (code: string) => void;
};

/** Fallback for when scanning isn't possible: paste a link or the bare code. */
export function ManualCodeEntry({ onCode }: ManualCodeEntryProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = () => {
    const code = parseShareCode(text);
    if (code === null) {
      setInvalid(true);
      return;
    }
    onCode(code);
  };

  return (
    <View className="gap-2">
      <Text className="t-eyebrow">{t('share.receive.scan.manualLabel')}</Text>
      <View className="flex-row items-center gap-2">
        <View
          className="h-[48px] flex-1 justify-center rounded-full bg-surface-card px-[18px]"
          style={shadows.row}
        >
          <TextInput
            accessibilityLabel={t('share.receive.scan.manualA11y')}
            className="p-0 text-[15px] font-medium text-foreground"
            placeholder={t('share.receive.scan.manualPlaceholder')}
            placeholderTextColor={colors.muted2}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            value={text}
            onChangeText={value => {
              setText(value);
              setInvalid(false);
            }}
            onSubmitEditing={submit}
          />
        </View>
        <Button size="sm" variant="secondary" onPress={submit}>
          {t('share.receive.scan.manualSubmit')}
        </Button>
      </View>
      {invalid ? (
        <Text className="t-caption text-danger">
          {t('share.receive.scan.manualInvalid')}
        </Text>
      ) : null}
    </View>
  );
}
