import { vi } from 'vitest';

// Dummy Supabase project so ingestEndpoint()/hasSupabaseConfig() are non-empty in the client tests.
// No real network — fetch is mocked in each test; this only enables the client's response-branching.
// env.ts reads import.meta.env lazily (getters), so stubEnv here takes effect for every test.
vi.stubEnv('WXT_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('WXT_SUPABASE_ANON_KEY', 'test-anon-key');
