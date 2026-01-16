
/**
 * Using the provided environment variables to interact with Supabase.
 * NOTE: The supabase-js client is assumed to be available or we can use fetch.
 * For this environment, we'll use standard fetch to interact with Supabase REST API.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export async function saveLead(email: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not found. Lead not saved.");
    return false;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email })
    });

    return response.ok;
  } catch (error) {
    console.error("Supabase Error:", error);
    return false;
  }
}
