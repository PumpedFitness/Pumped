import type { SetFieldDataType, SetFieldUnit } from '@/data/local/enums';
import type { SetTypeFieldConfig, SetTypeWithFields } from '@/types/setType';

/** A field being edited in the set-type editor. `id` is set for persisted
 *  fields (preserved on save so existing sets keep their values). */
export type DraftField = {
  key: string;
  id?: string;
  name: string;
  dataType: SetFieldDataType;
  unit: SetFieldUnit | null;
  config: SetTypeFieldConfig;
};

export function setTypeToDraftFields(
  type: SetTypeWithFields | undefined,
): DraftField[] {
  return (type?.fields ?? []).map(field => ({
    key: field.id,
    id: field.id,
    name: field.name,
    dataType: field.dataType,
    unit: field.unit,
    config: field.config,
  }));
}
