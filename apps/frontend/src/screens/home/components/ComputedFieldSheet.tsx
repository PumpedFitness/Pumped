import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Input } from 'heroui-native';
import { shadows } from '@pumped/ui';
import { TokenChips } from './TokenChips';
import {
  evaluateExpression,
  formatExpression,
  formatValue,
} from '../computedFieldEvaluator';

export type ComputedFieldDraft = {
  name: string;
  tokens: string[];
  unit: string;
};

type ComputedFieldSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (draft: ComputedFieldDraft) => void;
};

const INPUT_CLASS =
  'h-[50px] rounded-[18px] border-0 bg-surface-card px-[16px] text-[15px] font-[700] text-foreground';

/**
 * Computed-field builder sheet — name input, ink expression panel, token chips,
 * unit input, live preview and "Add to dashboard". README §5 "Computed field".
 */
export function ComputedFieldSheet({
  visible,
  onClose,
  onAdd,
}: ComputedFieldSheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [unit, setUnit] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setTokens([]);
      setUnit('');
    }
  }, [visible]);

  const preview = evaluateExpression(tokens);
  const expressionText = formatExpression(tokens);

  const submit = () => {
    const finalTokens =
      tokens.length > 0 ? tokens : ['Σ', 'sets', '×', 'reps', '×', 'load'];
    onAdd({
      name: name.trim() || t('home.computedSheet.defaultName'),
      tokens: finalTokens,
      unit: unit.trim(),
    });
  };

  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content backgroundClassName="bg-background">
          <BottomSheet.Title className="text-[22px] font-[800] tracking-[-0.44px] text-foreground">
            {t('home.computedSheet.title')}
          </BottomSheet.Title>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-[16px] pt-[16px] pb-[8px]"
          >
            <View className="gap-[8px]">
              <Text className="text-[12px] font-[600] text-muted">
                {t('home.computedSheet.nameLabel')}
              </Text>
              <Input
                className={INPUT_CLASS}
                placeholder={t('home.computedSheet.namePlaceholder')}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="gap-[8px]">
              <Text className="text-[12px] font-[600] text-muted">
                {t('home.computedSheet.expressionLabel')}
              </Text>
              <View
                className="min-h-[54px] justify-center rounded-[22px] bg-foreground px-[18px] py-[16px]"
                style={shadows.buttonInk}
              >
                <Text className="text-[14px] font-[600] leading-[1.6] text-on-ink">
                  {expressionText || t('home.computedSheet.expressionEmpty')}
                </Text>
              </View>
            </View>

            <TokenChips
              onAppend={token => setTokens(current => [...current, token])}
              onBackspace={() => setTokens(current => current.slice(0, -1))}
              backspaceLabel={t('home.computedSheet.backspaceA11y')}
            />

            <View className="flex-row gap-[12px]">
              <View className="flex-1 gap-[8px]">
                <Text className="text-[12px] font-[600] text-muted">
                  {t('home.computedSheet.unitLabel')}
                </Text>
                <Input
                  className={INPUT_CLASS}
                  placeholder={t('home.computedSheet.unitPlaceholder')}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
              <View
                className="flex-1 gap-[4px] rounded-[18px] bg-surface-card px-[16px] py-[13px]"
                style={shadows.row}
              >
                <Text className="text-[12px] font-[600] text-muted">
                  {t('home.computedSheet.previewLabel')}
                </Text>
                <Text className="text-[21px] font-[800] text-foreground">
                  {preview == null ? '—' : formatValue(preview)}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              testID="home-computed-add"
              onPress={submit}
              className="items-center justify-center rounded-full bg-foreground py-[19px] active:opacity-90"
              style={shadows.buttonInk}
            >
              <Text className="text-[14px] font-[700] text-on-ink">
                {t('home.computedSheet.add')}
              </Text>
            </Pressable>
          </ScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
