import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  titleClassName?: string;
  body: string;
  bodyClassName?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  titleClassName,
  body,
  bodyClassName,
  action,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={`items-center gap-3 rounded-[24px] border border-dashed border-border-hairline px-6 py-10${
        className ? ` ${className}` : ''
      }`}
    >
      {icon}
      <Text
        className={`t-heading${titleClassName ? ` ${titleClassName}` : ''}`}
      >
        {title}
      </Text>
      <Text
        className={`t-caption text-center${
          bodyClassName ? ` ${bodyClassName}` : ''
        }`}
      >
        {body}
      </Text>
      {action}
    </View>
  );
}
