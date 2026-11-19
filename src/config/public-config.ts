export type PublicConfig = Readonly<{
  supabase: Readonly<{ url: string; publishableKey: string }> | null;
}>;

type ConfigInput = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

export type ConfigResult =
  { ok: true; config: PublicConfig } | { ok: false; message: string };

export function parsePublicConfig(input: ConfigInput): ConfigResult {
  const url = input.supabaseUrl?.trim() ?? '';
  const publishableKey = input.supabasePublishableKey?.trim() ?? '';

  if (!url && !publishableKey) {
    return { ok: true, config: { supabase: null } };
  }
  if (!url || !publishableKey) {
    return {
      ok: false,
      message: 'Supply both public Supabase values or neither.',
    };
  }
  // Accept only publishable keys; legacy JWT and privileged keys are not config.
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
    return { ok: false, message: 'A Supabase publishable key is required.' };
  }
  try {
    const parsed = new URL(url);
    const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(
      parsed.hostname,
    );
    const safeProtocol =
      parsed.protocol === 'https:' ||
      (parsed.protocol === 'http:' && localHost);
    if (
      !safeProtocol ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      parsed.pathname !== '/'
    ) {
      return { ok: false, message: 'Use a valid public Supabase project URL.' };
    }
    return { ok: true, config: { supabase: { url, publishableKey } } };
  } catch {
    return { ok: false, message: 'Use a valid public Supabase project URL.' };
  }
}

export function readPublicConfig(): ConfigResult {
  // Expo statically inlines these exact accesses; do not enumerate process.env.
  return parsePublicConfig({
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
