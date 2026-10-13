import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OptionalWheelPickerSheet } from '@pumped/ui/forms/OptionalWheelPickerSheet';
import { PickerRow } from '@/components/exercise/PickerRow';
import {
  buildRestPickerConfig,
  formatRestValue,
} from '@/components/exercise/set-table';

type DefaultRestPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function DefaultRestPicker({ value, onChange }: DefaultRestPickerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const config = useMemo(
    () =>
      buildRestPickerConfig(t, value, {
        title: t('setTypeEditor.defaultRestTitle'),
        description: t('setTypeEditor.defaultRestHint'),
      }),
    [t, value],
  );

  return (
    <>
      <PickerRow
        label={t('setTypeEditor.defaultRestLabel')}
        value={value == null ? undefined : formatRestValue(value)}
        placeholder={t('setTypeEditor.defaultRestNone')}
        onPress={() => setVisible(true)}
      />
      <OptionalWheelPickerSheet
        visible={visible}
        value={value}
        config={config}
        onClose={() => setVisible(false)}
        onChange={onChange}
      />
    </>
  );
}
