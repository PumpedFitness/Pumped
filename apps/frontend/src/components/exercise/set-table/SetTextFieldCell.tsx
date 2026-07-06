import { useState, type ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/tokens';
import type { SetCardField } from './exerciseSetTableModel';

type SetTextFieldCellProps = {
  field: Extract<SetCardField, { kind: 'text' }>;
  label: ReactNode;
  hasError: boolean;
};

type TextFieldScrollIndicatorProps = {
  visibleHeight: number;
  contentHeight: number;
  scrollOffset: number;
  hasError: boolean;
};

const TEXT_FIELD_LINE_HEIGHT = 20;
const TEXT_FIELD_MIN_HEIGHT = 28;
const TEXT_FIELD_MAX_HEIGHT = TEXT_FIELD_LINE_HEIGHT * 3;
const TEXT_FIELD_SCROLL_THUMB_MIN_HEIGHT = 16;

function clampedTextFieldHeight(contentHeight: number) {
  return Math.min(
    Math.max(contentHeight, TEXT_FIELD_MIN_HEIGHT),
    TEXT_FIELD_MAX_HEIGHT,
  );
}

function textScrollThumbHeight(visibleHeight: number, contentHeight: number) {
  return Math.max(
    TEXT_FIELD_SCROLL_THUMB_MIN_HEIGHT,
    (visibleHeight / contentHeight) * visibleHeight,
  );
}

function textScrollThumbOffset(
  scrollOffset: number,
  visibleHeight: number,
  contentHeight: number,
  thumbHeight: number,
) {
  const maxScroll = Math.max(contentHeight - visibleHeight, 1);
  const maxOffset = visibleHeight - thumbHeight;
  return Math.min(
    maxOffset,
    Math.max(0, (scrollOffset / maxScroll) * maxOffset),
  );
}

function TextCellShell({
  hasError,
  children,
}: {
  hasError: boolean;
  children: ReactNode;
}) {
  return (
    <View className={`flex-1 px-3 py-2.5 ${hasError ? 'bg-danger/10' : ''}`}>
      {children}
    </View>
  );
}

function TextFieldScrollIndicator({
  visibleHeight,
  contentHeight,
  scrollOffset,
  hasError,
}: TextFieldScrollIndicatorProps) {
  const thumbHeight = textScrollThumbHeight(visibleHeight, contentHeight);
  const thumbOffset = textScrollThumbOffset(
    scrollOffset,
    visibleHeight,
    contentHeight,
    thumbHeight,
  );

  return (
    <View pointerEvents="none" className="absolute right-0 top-0 w-3 items-end">
      <View
        className="w-1 rounded-full bg-border-soft"
        style={{ height: visibleHeight }}
      >
        <View
          className={`w-1 rounded-full ${hasError ? 'bg-danger' : 'bg-muted'}`}
          style={{
            height: thumbHeight,
            transform: [{ translateY: thumbOffset }],
          }}
        />
      </View>
    </View>
  );
}

export function SetTextFieldCell({
  field,
  label,
  hasError,
}: SetTextFieldCellProps) {
  const [contentHeight, setContentHeight] = useState(TEXT_FIELD_MIN_HEIGHT);
  const [scrollOffset, setScrollOffset] = useState(0);
  const inputHeight = clampedTextFieldHeight(contentHeight);
  const isScrollable = contentHeight > TEXT_FIELD_MAX_HEIGHT;

  return (
    <TextCellShell hasError={hasError}>
      {label}
      {field.readOnly ? (
        <Text
          className="text-[15px] font-bold leading-[20px] text-foreground"
          numberOfLines={3}
          style={{ includeFontPadding: false }}
        >
          {field.value || '–'}
        </Text>
      ) : (
        <View className="relative">
          <TextInput
            accessibilityLabel={field.label}
            className={`min-h-7 p-0 text-[15px] font-semibold leading-[20px] text-foreground ${
              isScrollable ? 'pr-5' : ''
            }`}
            multiline
            numberOfLines={3}
            placeholder="–"
            placeholderTextColor={hasError ? colors.danger : colors.muted}
            scrollEnabled={isScrollable}
            style={{ height: inputHeight }}
            textAlignVertical="top"
            value={field.value}
            onChangeText={field.onChange}
            onContentSizeChange={event => {
              const nextHeight = event.nativeEvent.contentSize.height;
              setContentHeight(nextHeight);
              if (nextHeight <= TEXT_FIELD_MAX_HEIGHT) {
                setScrollOffset(0);
              }
            }}
            onScroll={event => {
              setScrollOffset(event.nativeEvent.contentOffset.y);
            }}
          />
          {isScrollable ? (
            <TextFieldScrollIndicator
              visibleHeight={inputHeight}
              contentHeight={contentHeight}
              scrollOffset={scrollOffset}
              hasError={hasError}
            />
          ) : null}
        </View>
      )}
    </TextCellShell>
  );
}
