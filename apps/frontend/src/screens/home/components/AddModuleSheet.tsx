import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from 'heroui-native';
import { ClayIcon, colors, shadows } from '@pumped/ui';
import {
  BUILTIN_KINDS,
  MODULE_META,
  type BuiltinModuleKind,
} from '../dashboardModules';

type AddModuleSheetProps = {
  visible: boolean;
  hiddenKinds: BuiltinModuleKind[];
  onClose: () => void;
  onAdd: (kind: BuiltinModuleKind) => void;
  onBuildComputed: () => void;
};

const CTA_SHADOW = {
  shadowColor: colors.accent,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.24,
  shadowRadius: 26,
  elevation: 6,
} as const;

/**
 * Add-module sheet — one row per hidden built-in module + the accent CTA that
 * opens the computed-field builder. README §5 "Add module".
 */
export function AddModuleSheet({
  visible,
  hiddenKinds,
  onClose,
  onAdd,
  onBuildComputed,
}: AddModuleSheetProps) {
  const { t } = useTranslation();
  const rows = BUILTIN_KINDS.filter(kind => hiddenKinds.includes(kind));

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
            {t('home.addSheet.title')}
          </BottomSheet.Title>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-[10px] pt-[16px] pb-[8px]"
          >
            {rows.map(kind => {
              const meta = MODULE_META[kind];
              return (
                <Pressable
                  key={kind}
                  accessibilityRole="button"
                  testID={`home-add-module-${kind}`}
                  onPress={() => onAdd(kind)}
                  className="flex-row items-center gap-[12px] rounded-[24px] bg-surface-card p-[17px] active:opacity-90"
                  style={shadows.row}
                >
                  <View className="flex-1">
                    <Text className="text-[16px] font-[700] text-foreground">
                      {t(meta.nameKey)}
                    </Text>
                    <Text className="mt-[3px] text-[12px] font-[500] text-muted">
                      {t(meta.descriptionKey)}
                    </Text>
                  </View>
                  <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1EFEC]">
                    <ClayIcon name="plus" size={16} stroke={2.2} color={colors.ink} />
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              testID="home-build-computed"
              onPress={onBuildComputed}
              className="mt-[6px] flex-row items-center gap-[12px] rounded-[24px] bg-accent p-[18px] active:opacity-90"
              style={CTA_SHADOW}
            >
              <View className="rounded-full bg-[rgba(255,255,255,0.24)] px-[8px] py-[4px]">
                <Text className="text-[11px] font-[700] text-on-ink">ƒx</Text>
              </View>
              <Text className="flex-1 text-[16px] font-[700] text-on-ink">
                {t('home.addSheet.buildComputed')}
              </Text>
              <ClayIcon name="chevron" size={18} stroke={2} color={colors.onInk} />
            </Pressable>
          </ScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
