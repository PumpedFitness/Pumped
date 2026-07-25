import { useCallback, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScrollViewContext from 'react-native/Libraries/Components/ScrollView/ScrollViewContext';
import {
  NestedReorderableList,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { ClayIcon, colors } from '@pumped/ui';
import { ModuleRenderer } from './ModuleRenderer';
import type { ModulePlacement } from '../dashboardModules';
import type { HomeDashboardData } from '../useHomeDashboardData';
import type { ComputedField } from '@/stores/computedFieldsStore';

const GAP = 12;

type ModuleGridProps = {
  modules: ModulePlacement[];
  data: HomeDashboardData;
  computedFieldById: Map<string, ComputedField>;
  editing: boolean;
  onRemove: (id: string) => void;
  onToggleSpan: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onOpenTrends: () => void;
};

type GridRow = { key: string; items: ModulePlacement[] };

// Pack single-span modules two-per-row; span-2 modules take a full row.
function packRows(modules: ModulePlacement[]): GridRow[] {
  const rows: GridRow[] = [];
  let pending: ModulePlacement | null = null;

  for (const module of modules) {
    if (module.span === 2) {
      if (pending) {
        rows.push({ key: pending.id, items: [pending] });
        pending = null;
      }
      rows.push({ key: module.id, items: [module] });
      continue;
    }
    if (pending) {
      rows.push({ key: `${pending.id}-${module.id}`, items: [pending, module] });
      pending = null;
    } else {
      pending = module;
    }
  }
  if (pending) rows.push({ key: pending.id, items: [pending] });
  return rows;
}

function DragHandle() {
  const { t } = useTranslation();
  const drag = useReorderableDrag();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.edit.reorderA11y')}
      hitSlop={8}
      onLongPress={drag}
      delayLongPress={140}
      className="h-[28px] w-[28px] items-center justify-center rounded-full bg-surface-sunk active:opacity-70"
    >
      <ClayIcon name="drag" size={16} color={colors.muted} />
    </Pressable>
  );
}

/**
 * The module canvas. In view mode it packs modules into a 2-column grid; in edit
 * mode it collapses to a single-column reorderable list (each module full-width)
 * so drag-to-reorder works cleanly and ⇱/✕ affordances have room. README §1.6 +
 * "Edit mode".
 */
export function ModuleGrid({
  modules,
  data,
  computedFieldById,
  editing,
  onRemove,
  onToggleSpan,
  onReorder,
  onOpenTrends,
}: ModuleGridProps) {
  const renderModule = useCallback(
    (placement: ModulePlacement, dragHandle?: ReactNode) => (
      <ModuleRenderer
        placement={placement}
        data={data}
        computedField={computedFieldById.get(placement.id) ?? null}
        editing={editing}
        onRemove={() => onRemove(placement.id)}
        onToggleSpan={() => onToggleSpan(placement.id)}
        onOpenTrends={onOpenTrends}
        dragHandle={dragHandle}
      />
    ),
    [data, computedFieldById, editing, onRemove, onToggleSpan, onOpenTrends],
  );

  if (editing) {
    return (
      <ScrollViewContext.Provider value={null}>
        <NestedReorderableList
          data={modules}
          scrollable={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderModule(item, <DragHandle />)}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          onReorder={({ from, to }: ReorderableListReorderEvent) => {
            const next = [...modules];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            onReorder(next.map(module => module.id));
          }}
        />
      </ScrollViewContext.Provider>
    );
  }

  const rows = packRows(modules);
  return (
    <View style={{ gap: GAP }}>
      {rows.map(row => (
        <View key={row.key} className="flex-row" style={{ gap: GAP }}>
          {row.items.map(item => (
            <View key={item.id} className="flex-1">
              {renderModule(item)}
            </View>
          ))}
          {row.items.length === 1 && row.items[0].span === 1 ? (
            <View className="flex-1" />
          ) : null}
        </View>
      ))}
    </View>
  );
}
