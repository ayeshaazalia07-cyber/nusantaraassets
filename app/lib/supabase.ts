import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Variabel 'supabase' di-export agar bisa dipanggil di file katalog
export const supabase = createClient(supabaseUrl, supabaseKey);
