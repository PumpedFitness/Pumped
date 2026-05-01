import {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {SvgIcon, Icons} from './IconButton';
import {colors} from '../theme/tokens';

interface StepperProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  size?: 'lg' | 'sm';
  disabled?: boolean;
}

export function Stepper({
  value, onChange, min = 0, max = 9999, step = 5, unit = 'lb', label, size = 'lg', disabled,
}: StepperProps) {
  const [pressed, setPressed] = useState<'inc' | 'dec' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rampRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  useEffect(() => { valueRef.current = value; }, [value]);

  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max]);
  const adjust = useCallback((dir: number) => { onChange?.(clamp(valueRef.current + dir * step)); }, [onChange, clamp, step]);

  const startRamp = useCallback((dir: number) => {
    if (disabled) return;
    setPressed(dir > 0 ? 'inc' : 'dec');
    adjust(dir);
    timerRef.current = setTimeout(() => {
      let interval = 180;
      const tick = () => { adjust(dir); interval = Math.max(50, interval * 0.85); rampRef.current = setTimeout(tick, interval); };
      rampRef.current = setTimeout(tick, interval);
    }, 320);
  }, [adjust, disabled]);

  const endRamp = useCallback(() => {
    setPressed(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rampRef.current) clearTimeout(rampRef.current);
  }, []);

  useEffect(() => () => endRamp(), [endRamp]);

  const isSmall = size === 'sm';
  const iconSize = isSmall ? 16 : 22;
  const formatValue = (v: number) => Number.isInteger(v) ? v.toString() : v.toFixed(1);

  return (
    <View className="gap-1.5">
      {(label || unit) && (
        <View className="flex-row justify-between items-baseline">
          <Text className="eyebrow">{label}</Text>
          {unit && !isSmall && <Text className="eyebrow opacity-70">{unit}</Text>}
        </View>
      )}
      <View className={`flex-row overflow-hidden rounded-sm bg-field-background border ${pressed ? 'border-accent' : 'border-border'} ${isSmall ? 'h-[52px]' : 'h-16'}`}>
        <Pressable
          onPressIn={() => startRamp(-1)} onPressOut={endRamp}
          disabled={disabled || value <= min}
          accessibilityLabel={`Decrease ${label || 'value'}`}
          className={`items-center justify-center ${isSmall ? 'w-12' : 'w-[52px]'} ${pressed === 'dec' ? 'bg-accent-soft' : ''} ${disabled || value <= min ? 'opacity-30' : ''}`}>
          <SvgIcon d={Icons.minus} size={iconSize} color={pressed === 'dec' ? colors.accent : colors.textSecondary} strokeWidth={2.5} />
        </Pressable>

        <View className="flex-1 items-center justify-center border-x border-border px-1.5">
          <Text className={isSmall ? 'font-mono text-xl font-semibold text-foreground tracking-tight' : 'mono-display'}>
            {formatValue(value)}
          </Text>
        </View>

        <Pressable
          onPressIn={() => startRamp(1)} onPressOut={endRamp}
          disabled={disabled || value >= max}
          accessibilityLabel={`Increase ${label || 'value'}`}
          className={`items-center justify-center ${isSmall ? 'w-12' : 'w-[52px]'} ${pressed === 'inc' ? 'bg-accent-soft' : ''} ${disabled || value >= max ? 'opacity-30' : ''}`}>
          <SvgIcon d={Icons.plus} size={iconSize} color={pressed === 'inc' ? colors.accent : colors.textSecondary} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}
