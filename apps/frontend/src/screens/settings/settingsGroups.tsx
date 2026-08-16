import type { ComponentType } from 'react';
import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { TranslationResource } from '@/i18n/resources';
import { IdentitySettings } from './components/IdentitySettings';
import { BodyTrackingSettings } from './components/BodyTrackingSettings';
import { TrainingSettings } from './components/TrainingSettings';
import { PreferenceSettings } from './components/PreferenceSettings';
import { DataSettings } from './components/DataSettings';
import { HealthSettings } from './components/HealthSettings';
import { ReadinessScaleSettings } from './components/ReadinessScaleSettings';

export type SettingsGroupId = 'you' | 'training' | 'app' | 'recovery';

type GroupKey = Extract<
  keyof TranslationResource['profile']['groups'],
  SettingsGroupId
>;

export type SettingsGroup = {
  id: SettingsGroupId;
  titleKey: `profile.groups.${GroupKey}.title`;
  subtitleKey: `profile.groups.${GroupKey}.subtitle`;
  icon: IconName;
  /** The sections this group is made of, in order. */
  sections: ComponentType[];
};

/**
 * The settings index, one entry per screen.
 *
 * A list rather than four routes: every group is the same screen with a
 * different set of sections, and a registry keeps the navigator from growing a
 * branch each time a group is added or a section moves between them.
 */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: 'you',
    titleKey: 'profile.groups.you.title',
    subtitleKey: 'profile.groups.you.subtitle',
    icon: 'user',
    sections: [IdentitySettings, BodyTrackingSettings],
  },
  {
    id: 'training',
    titleKey: 'profile.groups.training.title',
    subtitleKey: 'profile.groups.training.subtitle',
    icon: 'dumbbell',
    sections: [TrainingSettings],
  },
  {
    id: 'app',
    titleKey: 'profile.groups.app.title',
    subtitleKey: 'profile.groups.app.subtitle',
    icon: 'settings',
    sections: [PreferenceSettings, DataSettings],
  },
  {
    id: 'recovery',
    titleKey: 'profile.groups.recovery.title',
    subtitleKey: 'profile.groups.recovery.subtitle',
    icon: 'pulse',
    sections: [HealthSettings, ReadinessScaleSettings],
  },
];

export function settingsGroup(id: SettingsGroupId): SettingsGroup {
  return SETTINGS_GROUPS.find(group => group.id === id) ?? SETTINGS_GROUPS[0];
}
