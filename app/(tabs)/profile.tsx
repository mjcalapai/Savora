import { Link } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { AppText } from '@/components/ui/AppText';
import { theme } from '@/theme/tokens';

export default function ProfileScreen() {
  return (
    <PlaceholderScreen
      title="Profile"
      description="Your preferences and account settings will be here."
    >
      <Link
        href="/sign-in"
        accessibilityRole="link"
        style={{ paddingVertical: 16 }}
      >
        <AppText style={{ color: theme.colors.accent }}>
          Account access preview
        </AppText>
      </Link>
    </PlaceholderScreen>
  );
}
