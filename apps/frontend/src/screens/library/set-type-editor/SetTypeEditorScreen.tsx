import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from 'heroui-native';
import type { TFunction } from 'i18next';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { IconPicker } from '@/components/forms/IconPicker';
import {
  useSetTypeLibrary,
  type SetTypeLibrary,
} from '@/hooks/useSetTypeLibrary';
import { normalizeProgressionGoal } from '@/data/local/sets/progressionGoals';
import type { ProgressionGoal } from '@/types/setType';
import { ProgressionGoalEditor } from './ProgressionGoalEditor';
import { SetTypeFieldEditorSheet } from './SetTypeFieldEditorSheet';
import { setTypeToDraftFields, type DraftField } from './draft';

type SetTypeEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SetTypeEditor'
>;

// Persists the draft, preserving field ids so existing sets keep their values.
function persistDraft(
  library: SetTypeLibrary,
  existingId: string | undefined,
  existing: { fields: { id: string }[] } | undefined,
  name: string,
  icon: IconName | null,
  fields: DraftField[],
  progressionGoal: ProgressionGoal,
): void {
  const progressionFields = fields.map(field => ({
    ...field,
    id: field.id ?? field.key,
  }));
  const safeGoal = normalizeProgressionGoal(progressionGoal, progressionFields);
  let typeId = existingId;
  if (typeId) {
    library.updateSetType(typeId, {
      name: name.trim(),
      icon,
      progressionGoal: safeGoal,
    });
    const keptIds = new Set(fields.filter(f => f.id).map(f => f.id));
    (existing?.fields ?? []).forEach(field => {
      if (!keptIds.has(field.id)) {
        library.removeField(field.id);
      }
    });
  } else {
    typeId = library.createSetType(name.trim(), icon, safeGoal);
  }

  const orderedIds = fields.map(field => {
    const input = {
      name: field.name,
      dataType: field.dataType,
      unit: field.unit,
      config: field.config,
    };
    if (field.id) {
      library.updateField(field.id, input);
      return field.id;
    }
    return library.addField(typeId!, input);
  });
  library.reorderFields(orderedIds);
}

function fieldSubtitle(t: TFunction, field: DraftField): string {
  const parts: string[] = [t(`setField.dataType.${field.dataType}`)];
  if (field.dataType === 'number' || field.dataType === 'range') {
    parts.push(
      field.config.decimals === 0
        ? t('setTypeEditor.fieldSheet.numberFormat.integer', {
            defaultValue: 'Integer',
          })
        : t('setTypeEditor.fieldSheet.numberFormat.decimal', {
            defaultValue: 'Comma number',
          }),
    );
  }
  if (field.unit) {
    parts.push(
      field.unit === 'amount'
        ? t('setTypeEditor.fieldSheet.unit.weight', {
            defaultValue: 'Weight (settings)',
          })
        : t(`setField.unit.${field.unit}`),
    );
  }
  if (field.config.required) {
    parts.push(t('setTypeEditor.fieldSheet.requiredLabel'));
  }
  return parts.join(' · ');
}

type FieldRowProps = {
  field: DraftField;
  subtitle: string;
  onPress: () => void;
};

function FieldRow({ field, subtitle, onPress }: FieldRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-between rounded-[16px] border border-border-soft bg-surface-card px-4 py-3 active:bg-surface-sunk"
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="t-label text-foreground" numberOfLines={1}>
          {field.name}
        </Text>
        <Text className="t-caption mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <ClayIcon name="chevron" size={16} color={colors.muted} />
    </Pressable>
  );
}

type FieldsSectionProps = {
  fields: DraftField[];
  onAddField: () => void;
  onEditField: (field: DraftField) => void;
};

function FieldsSection({
  fields,
  onAddField,
  onEditField,
}: FieldsSectionProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-2">
      <Text className="t-eyebrow">{t('setTypeEditor.fieldsLabel')}</Text>
      {fields.length === 0 ? (
        <Text className="t-caption">{t('setTypeEditor.emptyFields')}</Text>
      ) : (
        fields.map(field => (
          <FieldRow
            key={field.key}
            field={field}
            subtitle={fieldSubtitle(t, field)}
            onPress={() => onEditField(field)}
          />
        ))
      )}
      <Pressable
        accessibilityRole="button"
        className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-dashed border-accent bg-accent-soft px-4"
        onPress={onAddField}
      >
        <ClayIcon name="plus" size={16} color={colors.accent} />
        <Text className="t-label text-accent">
          {t('setTypeEditor.addField')}
        </Text>
      </Pressable>
    </View>
  );
}

export function SetTypeEditorScreen({
  navigation,
  route,
}: SetTypeEditorScreenProps) {
  const { t } = useTranslation();
  const library = useSetTypeLibrary();
  const existing = route.params?.setTypeId
    ? library.byId.get(route.params.setTypeId)
    : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState<IconName | null>(
    (existing?.icon as IconName | null) ?? null,
  );
  const [fields, setFields] = useState<DraftField[]>(() =>
    setTypeToDraftFields(existing),
  );
  const [progressionGoal, setProgressionGoal] = useState<ProgressionGoal>(
    existing?.progressionGoal ?? { kind: 'none' },
  );
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<DraftField | null>(null);
  const [isFieldSheetOpen, setIsFieldSheetOpen] = useState(false);

  const openNewField = () => {
    setEditingField(null);
    setIsFieldSheetOpen(true);
  };

  const openEditField = (field: DraftField) => {
    setEditingField(field);
    setIsFieldSheetOpen(true);
  };

  const saveField = (next: DraftField) => {
    setFields(current => {
      const index = current.findIndex(field => field.key === next.key);
      if (index === -1) {
        return [...current, next];
      }
      return current.map(field => (field.key === next.key ? next : field));
    });
  };

  const removeField = (key: string) => {
    setFields(current => current.filter(field => field.key !== key));
  };

  const done = () => {
    if (!name.trim()) {
      setError(t('setTypeEditor.errors.nameRequired'));
      return;
    }
    persistDraft(
      library,
      existing?.id,
      existing,
      name,
      icon,
      fields,
      progressionGoal,
    );
    navigation.goBack();
  };

  const deleteSetType = () => {
    if (existing) {
      library.deleteSetType(existing.id);
    }
    navigation.goBack();
  };

  return (
    <AppView edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ModalHeader
          title={
            existing
              ? t('setTypeEditor.editTitle')
              : t('setTypeEditor.newTitle')
          }
          rightLabel={t('setTypeEditor.done')}
          onLeftPress={() => navigation.goBack()}
          onRightPress={done}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 pb-10 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1.5">
            <Text className="t-eyebrow">{t('setTypeEditor.nameLabel')}</Text>
            <Input
              className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
              placeholder={t('setTypeEditor.namePlaceholder')}
              value={name}
              onChangeText={value => {
                setName(value);
                setError(null);
              }}
            />
            {error ? (
              <Text className="t-caption text-danger">{error}</Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="t-eyebrow">{t('setTypeEditor.iconLabel')}</Text>
            <IconPicker value={icon} onChange={setIcon} />
          </View>

          <FieldsSection
            fields={fields}
            onAddField={openNewField}
            onEditField={openEditField}
          />

          <ProgressionGoalEditor
            fields={fields}
            value={progressionGoal}
            onChange={setProgressionGoal}
          />

          {existing && !existing.isBuiltIn ? (
            <Pressable
              accessibilityRole="button"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-full active:bg-surface-sunk"
              onPress={deleteSetType}
            >
              <ClayIcon name="trash" size={16} color={colors.danger} />
              <Text className="t-label text-danger">
                {t('setTypeEditor.deleteSetType')}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <SetTypeFieldEditorSheet
        visible={isFieldSheetOpen}
        field={editingField}
        onClose={() => setIsFieldSheetOpen(false)}
        onSave={saveField}
        onRemove={
          editingField ? () => removeField(editingField.key) : undefined
        }
      />
    </AppView>
  );
}
