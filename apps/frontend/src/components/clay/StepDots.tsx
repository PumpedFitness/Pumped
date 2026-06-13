import { View } from 'react-native';

type StepDotsProps = {
  current: number;
  total: number;
  className?: string;
};

export function StepDots({ current, total, className = '' }: StepDotsProps) {
  return (
    <View className={`flex-row items-center gap-2 self-center ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1.5 rounded-[3px] ${
            i === current ? 'w-6 bg-accent' : 'w-1.5 bg-[rgba(52,54,44,0.09)]'
          }`}
        />
      ))}
    </View>
  );
}
