import { parsePublicConfig } from '../src/config/public-config';

const publicPair = {
  supabaseUrl: 'https://example.supabase.co',
  supabasePublishableKey: 'sb_publishable_test_fixture',
};

describe('public configuration boundary', () => {
  it('launches without backend configuration', () => {
    expect(parsePublicConfig({})).toEqual({
      ok: true,
      config: { supabase: null },
    });
    expect(
      parsePublicConfig({ supabaseUrl: ' ', supabasePublishableKey: '' }),
    ).toEqual({ ok: true, config: { supabase: null } });
  });

  it('accepts paired public values and local development URLs', () => {
    expect(parsePublicConfig(publicPair)).toEqual({
      ok: true,
      config: {
        supabase: {
          url: publicPair.supabaseUrl,
          publishableKey: publicPair.supabasePublishableKey,
        },
      },
    });
    expect(
      parsePublicConfig({
        ...publicPair,
        supabaseUrl: 'http://localhost:54321',
      }).ok,
    ).toBe(true);
  });

  it.each([
    { supabaseUrl: publicPair.supabaseUrl },
    { supabasePublishableKey: publicPair.supabasePublishableKey },
    { ...publicPair, supabaseUrl: 'not-a-url' },
    { ...publicPair, supabaseUrl: 'http://example.supabase.co' },
    { ...publicPair, supabaseUrl: 'https://name:password@example.supabase.co' },
    { ...publicPair, supabaseUrl: 'https://example.supabase.co/?token=value' },
    { ...publicPair, supabaseUrl: 'https://example.supabase.co/path' },
    {
      ...publicPair,
      supabasePublishableKey: 'sb_secret_fixture_do_not_bundle',
    },
    { ...publicPair, supabasePublishableKey: 'eyJhbGciOi_test_legacy_JWT' },
  ])(
    'rejects invalid or unsafe configuration without echoing values',
    (input) => {
      const result = parsePublicConfig(input);
      expect(result.ok).toBe(false);
      expect(JSON.stringify(result)).not.toContain('password');
      expect(JSON.stringify(result)).not.toContain('fixture_do_not_bundle');
      expect(JSON.stringify(result)).not.toContain('eyJhbGciOi');
    },
  );
});
