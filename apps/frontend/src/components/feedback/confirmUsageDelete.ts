import { Alert } from 'react-native';
import type { TFunction } from 'i18next';
import {
  usageNamePreview,
  type UsageInfo,
  type UsageKind,
} from '@/data/local/usageModel';

const REFERENCE_KEY = {
  template: 'usage.alert.template',
  exercise: 'usage.alert.exercise',
  setType: 'usage.alert.setType',
} as const;

const CONSEQUENCE_KEY = {
  template: 'usage.alert.consequence.template',
  exercise: 'usage.alert.consequence.exercise',
  setType: 'usage.alert.consequence.setType',
} as const;

/** Spells out who depends on the item, what deleting it does, and the plan hit. */
export function usageAlertBody(
  t: TFunction,
  kind: UsageKind,
  usage: UsageInfo,
): string {
  const { list, overflow } = usageNamePreview(usage.names);
  const references = t(REFERENCE_KEY[kind], {
    count: usage.names.length,
    list:
      overflow > 0 ? t('usage.alert.more', { list, count: overflow }) : list,
  });

  const paragraphs = [`${references} ${t(CONSEQUENCE_KEY[kind])}`];
  if (usage.activeScheduleName) {
    paragraphs.push(
      t(
        kind === 'template'
          ? 'usage.alert.activeTemplate'
          : 'usage.alert.activeIndirect',
        { schedule: usage.activeScheduleName },
      ),
    );
  }
  return paragraphs.join('\n\n');
}

type ConfirmUsageDeleteOptions = {
  kind: UsageKind;
  name: string;
  /** Undefined (or empty) means nothing references the item. */
  usage: UsageInfo | undefined;
  /**
   * Message for the unused case. Omit it where the gesture is confirmation
   * enough (a swipe row, backed by the undo toast) to delete straight away.
   */
  fallbackBody?: string;
};

/**
 * Deletes a library item, warning first when something still depends on it.
 * Resolves `true` once deleted, `false` when the user backs out — which lets a
 * swipe row spring back instead of being removed.
 */
export function confirmUsageDelete(
  t: TFunction,
  { kind, name, usage, fallbackBody }: ConfirmUsageDeleteOptions,
  remove: () => void,
): Promise<boolean> {
  const used = usage && usage.names.length > 0 ? usage : null;
  if (!used && fallbackBody === undefined) {
    remove();
    return Promise.resolve(true);
  }

  return new Promise<boolean>(resolve => {
    Alert.alert(
      t('usage.alert.title', { name }),
      used ? usageAlertBody(t, kind, used) : fallbackBody,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            remove();
            resolve(true);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
