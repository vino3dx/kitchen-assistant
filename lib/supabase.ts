import { createClient } from "@supabase/supabase-js";


// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


// 创建 Supabase Client
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);