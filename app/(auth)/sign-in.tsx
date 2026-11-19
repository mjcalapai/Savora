import { Link } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { AppText } from '@/components/ui/AppText';
import { theme } from '@/theme/tokens';

export default function SignInScreen() {
  return (
    <PlaceholderScreen
      title="Account access"
      description="Secure sign-in and registration will be available in a future update."
    >
      <Link href="/" accessibilityRole="link" style={{ paddingVertical: 16 }}>
        <AppText style={{ color: theme.colors.accent }}>
          Back to Dashboard
        </AppText>
      </Link>
    </PlaceholderScreen>
  );
}
