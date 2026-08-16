import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  /** Optional — omit for a text-only card. */
  icon?: ReactNode;
  title: string;
  titleClassName?: string;
  body: string;
  bodyClassName?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * The dashed "nothing here yet" card.
 *
 * Spacing is set per gap rather than by one `gap` on the container: title and
 * body are a single sentence and belong close together, while the action is a
 * separate offer and needs air above it. A uniform gap gave the button the same
 * 12px as the line break inside the message, which read as one crowded block
 * floating in an otherwise roomy card.
 */
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
      className={`items-center rounded-[24px] border border-dashed border-border-hairline px-7 py-12${
        className ? ` ${className}` : ''
      }`}
    >
      {icon ? <View className="mb-4">{icon}</View> : null}
      <Text
        className={`t-heading text-center${
          titleClassName ? ` ${titleClassName}` : ''
        }`}
      >
        {title}
      </Text>
      <Text
        className={`t-caption mt-2 text-center${
          bodyClassName ? ` ${bodyClassName}` : ''
        }`}
      >
        {body}
      </Text>
      {action ? <View className="mt-6">{action}</View> : null}
    </View>
  );
}
