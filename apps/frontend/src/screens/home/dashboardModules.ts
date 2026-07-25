import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { TranslationResource } from '@/i18n/resources';

// The v2 dashboard module vocabulary (README §1). `custom` is the template for
// user-authored computed fields — each stored computed field becomes one module
// instance whose id is the field id.
export type ModuleKind =
  | 'tonnage'
  | 'e1rm'
  | 'readiness'
  | 'adherence'
  | 'bodyweight'
  | 'muscleVolume'
  | 'custom';

export type ModulePlacement = {
  /** Instance id — stable across reorder; a computed field reuses its field id. */
  id: string;
  kind: ModuleKind;
  /** 1 or 2 columns. */
  span: 1 | 2;
};

// Literal i18n keys for the built-in module copy, derived from the resource
// tree so `t(meta.nameKey)` typechecks (same pattern as WidgetNameKey). Only the
// built-ins carry name/description copy — `custom` has no such keys.
type ModuleI18nKind = Extract<
  keyof TranslationResource['home']['modules'],
  Exclude<ModuleKind, 'custom'>
>;
export type ModuleNameKey = `home.modules.${ModuleI18nKind}.name`;
export type ModuleDescriptionKey = `home.modules.${ModuleI18nKind}.description`;

export type ModuleMeta = {
  kind: ModuleKind;
  /** i18n key for the Add-module sheet title. */
  nameKey: ModuleNameKey;
  /** i18n key for the Add-module sheet description. */
  descriptionKey: ModuleDescriptionKey;
  icon: IconName;
  allowedSpans: (1 | 2)[];
  defaultSpan: 1 | 2;
};

// Built-in modules (everything except user computed fields). Order here is the
// order they appear in the Add-module sheet.
export const MODULE_META: Record<Exclude<ModuleKind, 'custom'>, ModuleMeta> = {
  tonnage: {
    kind: 'tonnage',
    nameKey: 'home.modules.tonnage.name',
    descriptionKey: 'home.modules.tonnage.description',
    icon: 'trend',
    allowedSpans: [1, 2],
    defaultSpan: 1,
  },
  e1rm: {
    kind: 'e1rm',
    nameKey: 'home.modules.e1rm.name',
    descriptionKey: 'home.modules.e1rm.description',
    icon: 'award',
    allowedSpans: [1, 2],
    defaultSpan: 1,
  },
  readiness: {
    kind: 'readiness',
    nameKey: 'home.modules.readiness.name',
    descriptionKey: 'home.modules.readiness.description',
    icon: 'pulse',
    allowedSpans: [2],
    defaultSpan: 2,
  },
  adherence: {
    kind: 'adherence',
    nameKey: 'home.modules.adherence.name',
    descriptionKey: 'home.modules.adherence.description',
    icon: 'calendar',
    allowedSpans: [1, 2],
    defaultSpan: 1,
  },
  bodyweight: {
    kind: 'bodyweight',
    nameKey: 'home.modules.bodyweight.name',
    descriptionKey: 'home.modules.bodyweight.description',
    icon: 'scale',
    allowedSpans: [1, 2],
    defaultSpan: 1,
  },
  muscleVolume: {
    kind: 'muscleVolume',
    nameKey: 'home.modules.muscleVolume.name',
    descriptionKey: 'home.modules.muscleVolume.description',
    icon: 'dumbbell',
    allowedSpans: [2],
    defaultSpan: 2,
  },
};

// The built-in module kinds — everything MODULE_META provides copy for. The
// Add-module sheet only offers these; `custom` is handled separately.
export type BuiltinModuleKind = keyof typeof MODULE_META;

export const BUILTIN_KINDS = Object.keys(MODULE_META) as BuiltinModuleKind[];

// Default canvas — mirrors the README screenshot ordering.
export const DEFAULT_MODULES: ModulePlacement[] = [
  { id: 'tonnage', kind: 'tonnage', span: 1 },
  { id: 'e1rm', kind: 'e1rm', span: 1 },
  { id: 'readiness', kind: 'readiness', span: 2 },
  { id: 'adherence', kind: 'adherence', span: 1 },
  { id: 'bodyweight', kind: 'bodyweight', span: 1 },
];
