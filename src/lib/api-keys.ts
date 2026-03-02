import { nanoid } from 'nanoid';
import { createAdminClient } from './supabase/admin';

const API_KEY_PREFIX = 'adns_k1_';

export function generateApiKey(): { key: string; prefix: string } {
  const random = nanoid(32);
  const key = `${API_KEY_PREFIX}${random}`;
  const prefix = key.slice(0, 12);
  return { key, prefix };
}

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function validateApiKey(
  authHeader: string | null
): Promise<{ valid: boolean; ownerId?: string; scopes?: string[]; keyPrefix?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }

  const key = authHeader.slice(7);
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false };
  }

  const keyHash = await hashApiKey(key);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('api_keys')
    .select('owner_id, scopes, key_prefix, expires_at, is_active')
    .eq('key_hash', keyHash)
    .single();

  if (error || !data || !data.is_active) {
    return { valid: false };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false };
  }

  // Update last_used_at (fire-and-forget)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)
    .then(() => {});

  return {
    valid: true,
    ownerId: data.owner_id,
    scopes: data.scopes,
    keyPrefix: data.key_prefix,
  };
}
