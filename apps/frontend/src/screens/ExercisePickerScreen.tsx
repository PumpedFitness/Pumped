import {useState} from 'react';
import {View, Text, TextInput, ScrollView, Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Button} from 'heroui-native';
import {AppBar} from '../components/AppBar';
import {IconButton, Icons, SvgIcon} from '../components/IconButton';
import {colors} from '../theme/tokens';

interface ExerciseItem { name: string; meta: string; last?: string; }

const exerciseGroups: {head: string; items: ExerciseItem[]}[] = [
  {head: 'Recent', items: [
    {name: 'Bench Press', meta: 'Chest · Barbell', last: '2d'},
    {name: 'Squat', meta: 'Legs · Barbell', last: '3d'},
  ]},
  {head: 'All exercises', items: [
    {name: 'Cable Fly', meta: 'Chest · Cable'},
    {name: 'Chin-Up', meta: 'Back · Bodyweight'},
    {name: 'Deadlift', meta: 'Back · Barbell'},
    {name: 'Dumbbell Curl', meta: 'Arms · Dumbbell'},
    {name: 'Face Pull', meta: 'Shoulders · Cable'},
    {name: 'Hip Thrust', meta: 'Glutes · Barbell'},
    {name: 'Incline Dumbbell Press', meta: 'Chest · Dumbbell'},
    {name: 'Lat Pulldown', meta: 'Back · Cable'},
  ]},
];

export function ExercisePickerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set(['Bench Press', 'Cable Fly']));

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const filterItems = (items: ExerciseItem[]) =>
    query ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase())) : items;

  return (
    <View className="flex-1 bg-background" style={{paddingTop: insets.top}}>
      <AppBar
        title="Add Exercises"
        leading={<IconButton icon={Icons.x} label="Cancel" onPress={() => navigation.goBack()} />}
        trailing={<Text className="eyebrow px-2">{selected.size} selected</Text>}
      />

      {/* Search */}
      <View className="p-3 px-4 flex-row gap-2 border-b border-border-soft">
        <View className="flex-1 relative">
          <TextInput
            value={query} onChangeText={setQuery}
            placeholder="Search exercises" placeholderTextColor="#6F767D"
            className="h-11 pl-10 pr-4 bg-field-background text-foreground text-[15px] rounded-sm border border-border"
          />
          <View className="absolute left-3.5 top-3">
            <SvgIcon d={Icons.search} size={18} color={colors.textMuted} />
          </View>
        </View>
        <IconButton icon={Icons.filter} label="Filter" bordered />
      </View>

      <ScrollView className="flex-1">
        {exerciseGroups.map(group => {
          const items = filterItems(group.items);
          if (items.length === 0) return null;
          return (
            <View key={group.head}>
              <Text className="eyebrow px-4 pt-3.5 pb-1.5">{group.head}</Text>
              {items.map((item, i) => {
                const isSel = selected.has(item.name);
                return (
                  <Pressable
                    key={item.name} onPress={() => toggle(item.name)}
                    className={`flex-row items-center gap-3 min-h-14 px-4 py-3 active:bg-surface-hover ${i > 0 ? 'border-t border-border-soft' : ''}`}>
                    <View className={`w-8 h-8 rounded-sm items-center justify-center border ${isSel ? 'border-accent bg-accent' : 'border-border-strong'}`}>
                      {isSel && <SvgIcon d={Icons.check} size={18} color={colors.accentForeground} strokeWidth={3} />}
                    </View>
                    <View className="flex-1">
                      <Text className="body-text">{item.name}</Text>
                      <Text className="body-sub mt-0.5">{item.meta}</Text>
                    </View>
                    {item.last && (
                      <View className="h-[22px] px-2 rounded-sm items-center justify-center border border-border bg-background">
                        <Text className="mono-sm text-foreground-secondary">{item.last}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View className="px-4 pt-3 border-t border-border bg-surface" style={{paddingBottom: insets.bottom + 12}}>
        <Button variant="primary" size="lg" className="w-full rounded-sm" isDisabled={selected.size === 0}>
          <Button.Label>Add {selected.size > 0 ? `${selected.size} ` : ''}exercise{selected.size === 1 ? '' : 's'}</Button.Label>
        </Button>
      </View>
    </View>
  );
}
