import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme/tokens';
import { AppText } from './ui/AppText';
import { Screen } from './ui/Screen';

type Props = PropsWithChildren<{ title: string; description: string }>;

export function PlaceholderScreen({ title, description, children }: Props) {
  return (
    <Screen>
      <AppText variant="label" muted>
        SAVORA
      </AppText>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <View style={styles.card}>
        <AppText>{description}</AppText>
        <AppText muted>Save with purpose. Spend with confidence.</AppText>
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
