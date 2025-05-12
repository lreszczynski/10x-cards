import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing PUBLIC_SUPABASE_URL environment variable');
if (!supabaseAnonKey) throw new Error('Missing PUBLIC_SUPABASE_KEY environment variable');

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = "cecbbbef-8e0e-4ff6-bb0a-125973a3371f";