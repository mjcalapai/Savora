import { Link } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function NotFoundScreen() {
  return (
    <PlaceholderScreen
      title="Page not found"
      description="This page is unavailable."
    >
      <Link href="/">Return to Dashboard</Link>
    </PlaceholderScreen>
  );
}
