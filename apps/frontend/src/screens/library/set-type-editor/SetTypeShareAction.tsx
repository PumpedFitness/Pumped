import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { ShareSheet } from '@/components/share/ShareSheet';
import { buildSetTypeShare } from '@/data/local/share/exportShare';
import type { SetTypeWithFields } from '@/types/setType';

type SetTypeShareActionProps = {
  setType: SetTypeWithFields;
};

/**
 * Shares a saved custom set type. Built-ins exist on every device, so callers
 * only render this for custom types. Shares the saved version — unsaved edits
 * in the editor stay on this device.
 */
export function SetTypeShareAction({ setType }: SetTypeShareActionProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-border-hairline active:bg-surface-sunk"
        onPress={() => setVisible(true)}
      >
        <ClayIcon name="arrowUp" size={16} color={colors.ink} />
        <Text className="t-label text-foreground">
          {t('share.send.setTypeCta')}
        </Text>
      </Pressable>

      <ShareSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={setType.name}
        kindLabel={t('share.send.kinds.setType')}
        buildEnvelope={() => buildSetTypeShare(setType.id)}
      />
    </>
  );
}
