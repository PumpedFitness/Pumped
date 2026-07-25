import { Text, View } from 'react-native';
import { Badge } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';
import {
  evaluateExpression,
  formatExpression,
  formatValue,
} from '../../computedFieldEvaluator';
import type { ComputedField } from '@/stores/computedFieldsStore';

type ComputedFieldModuleProps = {
  field: ComputedField;
  errorLabel: string;
};

/**
 * Computed-field module — the user's name, evaluated value + unit, and the raw
 * expression. Accent-outlined via the ModuleShell `outlined` flag. README §1.
 */
export function ComputedFieldModule({
  field,
  errorLabel,
}: ComputedFieldModuleProps) {
  const result = evaluateExpression(field.tokens);
  const expression = formatExpression(field.tokens);

  return (
    <View className="gap-[10px]">
      <ModuleLabelRow label={field.name} right={<Badge tone="accent">ƒx</Badge>} />
      <View className="flex-row items-baseline">
        <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
          {result == null ? errorLabel : formatValue(result)}
        </Text>
        {field.unit ? (
          <Text className="ml-[3px] text-[13px] font-[600] text-muted">
            {field.unit}
          </Text>
        ) : null}
      </View>
      <Text className="text-[11px] font-[500] leading-[1.5] text-[#A9A6A1]">
        {expression}
      </Text>
    </View>
  );
}
