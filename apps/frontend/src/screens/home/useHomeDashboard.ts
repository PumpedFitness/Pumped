import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useHomeDashboardStore } from '@/stores/homeDashboardStore';
import {
  useComputedFieldsStore,
  type ComputedField,
} from '@/stores/computedFieldsStore';
import { useHomeDashboardData } from './useHomeDashboardData';
import {
  BUILTIN_KINDS,
  MODULE_META,
  type BuiltinModuleKind,
} from './dashboardModules';
import type { ComputedFieldDraft } from './components/ComputedFieldSheet';

type SheetKind = null | 'add' | 'computed';

export function useHomeDashboard() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const data = useHomeDashboardData();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  const modules = useHomeDashboardStore(state => state.modules);
  const addModule = useHomeDashboardStore(state => state.addModule);
  const removeModule = useHomeDashboardStore(state => state.removeModule);
  const toggleSpan = useHomeDashboardStore(state => state.toggleSpan);
  const reorderByIds = useHomeDashboardStore(state => state.reorderByIds);

  const fields = useComputedFieldsStore(state => state.fields);
  const addField = useComputedFieldsStore(state => state.addField);
  const removeField = useComputedFieldsStore(state => state.removeField);

  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState<SheetKind>(null);

  const computedFieldById = useMemo(
    () => new Map(fields.map(field => [field.id, field] as const)),
    [fields],
  );

  // Built-in modules currently off the canvas — the Add-module sheet rows.
  const hiddenKinds = useMemo<BuiltinModuleKind[]>(() => {
    const placed = new Set(modules.map(module => module.kind));
    return BUILTIN_KINDS.filter(kind => !placed.has(kind));
  }, [modules]);

  const toggleEdit = useCallback(() => {
    setEditing(prev => !prev);
    setSheet(null);
  }, []);

  const openAddSheet = useCallback(() => setSheet('add'), []);
  const openComputedSheet = useCallback(() => setSheet('computed'), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const handleAddModule = useCallback(
    (kind: BuiltinModuleKind) => {
      addModule(kind, kind, MODULE_META[kind].defaultSpan);
      setSheet(null);
    },
    [addModule],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeModule(id);
      // A removed computed field is also dropped from storage so it doesn't
      // reappear as an orphaned definition.
      if (computedFieldById.has(id)) removeField(id);
    },
    [removeModule, removeField, computedFieldById],
  );

  const handleAddComputed = useCallback(
    (draft: ComputedFieldDraft) => {
      const field: ComputedField = addField(draft);
      addModule('custom', field.id, 1);
      setSheet(null);
    },
    [addField, addModule],
  );

  const startSession = useCallback(() => {
    const templateId = data.nextSession?.templateId;
    if (!templateId) return;
    if (currentWorkout) {
      openCurrentWorkout(navigation);
      return;
    }
    try {
      setEditing(false);
      startTemplateWorkout(templateId);
      openCurrentWorkout(navigation);
    } catch (error) {
      Alert.alert(
        t('plan.alerts.startFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  }, [data.nextSession, currentWorkout, navigation, startTemplateWorkout, t]);

  const openTrends = useCallback(() => {
    if (editing) return;
    // Trends must be registered on the root stack (see nav report in task
    // output). CommonActions.navigate keeps this typecheck-safe until the route
    // is added to RootStackParamList.
    navigation.dispatch(CommonActions.navigate({ name: 'Trends' }));
  }, [editing, navigation]);

  const openTimer = useCallback(() => {
    if (currentWorkout) {
      openCurrentWorkout(navigation);
    } else {
      startSession();
    }
  }, [currentWorkout, navigation, startSession]);

  const openWeighIn = useCallback(() => {
    navigation.navigate('AddMetric', { metric: 'weight' });
  }, [navigation]);

  return {
    data,
    modules,
    computedFieldById,
    hiddenKinds,
    editing,
    sheet,
    toggleEdit,
    openAddSheet,
    openComputedSheet,
    closeSheet,
    handleAddModule,
    handleRemove,
    handleAddComputed,
    handleToggleSpan: toggleSpan,
    handleReorder: reorderByIds,
    startSession,
    openTrends,
    openTimer,
    openWeighIn,
  };
}
