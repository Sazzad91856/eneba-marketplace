
import { createClient } from "@supabase/supabase-js";

// Supabase project URL
const supabaseUrl = "https://biatmmbqniffaosdssqo.supabase.co";

// Supabase publishable API key
const supabasePublishableKey =
  "sb_publishable_REOxRcGlJ1Bw6UuDOL1N0A_btwC9maK";

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
