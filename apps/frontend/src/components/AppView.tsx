import type {ReactNode} from 'react';
import {withUniwind} from 'uniwind';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {SafeAreaViewProps} from 'react-native-safe-area-context';

const StyledSafeAreaView = withUniwind(SafeAreaView);

type AppViewProps = {
  children: ReactNode;
  edges?: SafeAreaViewProps['edges'];
  className?: string;
};

export function AppView({children, edges = ['top'], className = ''}: AppViewProps) {
  return (
    <StyledSafeAreaView
      className={`flex-1 bg-background ${className}`}
      edges={edges}>
      {children}
    </StyledSafeAreaView>
  );
}
