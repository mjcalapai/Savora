import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';

export function LoadingState({ message = 'Loading Savora…' }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator color={theme.colors.accent} />
      <AppText>{message}</AppText>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText accessibilityRole="alert" variant="heading">
        Something went wrong
      </AppText>
      <AppText muted>Please try again.</AppText>
      {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}
