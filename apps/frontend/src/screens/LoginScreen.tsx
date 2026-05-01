import {useState} from 'react';
import {View, Text, TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from 'heroui-native';
import {AppView} from '../components/AppView';
import {Wordmark} from '../components/Wordmark';
import {SyncStatus} from '../components/SyncStatus';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences';
};

function InputField({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="eyebrow">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6F767D"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`h-[52px] px-4 bg-field-background text-foreground text-[17px] rounded-sm border ${focused ? 'border-accent' : 'border-border'}`}
      />
    </View>
  );
}

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('alex@gym.co');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Main');
    }, 1200);
  };

  return (
    <AppView edges={['top', 'bottom']} className="px-5">
      <View className="flex-row items-center justify-between mb-16 mt-6">
        <Wordmark />
        <SyncStatus state="offline" />
      </View>

      <View className="flex-1 gap-2">
        <Text className="heading-lg">
          Lift.{'\n'}
          <Text className="text-accent">Log.</Text> Repeat.
        </Text>
        <Text className="text-muted text-[15px] mt-3 mb-8 leading-relaxed max-w-[280px]">
          A workout tracker that works without signal. Sign in or keep going as a guest.
        </Text>

        <View className="gap-4">
          <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@somewhere.co" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
        </View>
      </View>

      <View className="gap-3 mt-6 mb-2">
        <Button variant="primary" size="lg" className="w-full rounded-sm" onPress={handleSignIn}>
          <Button.Label>{loading ? 'Signing in...' : 'Sign in'}</Button.Label>
        </Button>
        <Button variant="ghost" size="md" className="w-full rounded-sm" onPress={() => navigation.replace('Main')}>
          <Button.Label>Continue as guest</Button.Label>
        </Button>
      </View>
    </AppView>
  );
}
