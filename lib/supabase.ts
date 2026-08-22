import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").trim();
const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_KEY ??
    ""
  ).trim();

const ENV_HINT_CLIENT =
  "请在项目根目录 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY，并重启 dev。" +
  "浏览器端仅能读取 NEXT_PUBLIC_ 前缀的变量。";

function validate(): { ok: true } | { ok: false; message: string } {
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      ok: false,
      message:
        "Supabase 环境变量缺失。" +
        (typeof window !== "undefined"
          ? ENV_HINT_CLIENT
          : "服务端未读取到 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。"),
    };
  }
  let url: URL;
  try {
    url = new URL(NEXT_PUBLIC_SUPABASE_URL);
  } catch {
    return { ok: false, message: `NEXT_PUBLIC_SUPABASE_URL 不是合法 URL: ${NEXT_PUBLIC_SUPABASE_URL}` };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, message: `NEXT_PUBLIC_SUPABASE_URL 协议必须为 http(s)，当前：${url.protocol}` };
  }
  const placeholders = new Set(["", "anon", "public", "your-supabase-anon-key", "your-supabase-key", "xxx"]);
  const k = NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (placeholders.has(k.toLowerCase()) || k.length < 20) {
    return {
      ok: false,
      message:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY 长度过短或为占位值。" +
        "请从 Supabase 控制台 → Project Settings → API 复制 anon public / publishable key（不要用 service_role）。",
    };
  }
  // 禁止把服务端密钥暴露在 NEXT_PUBLIC_* 变量中（防泄漏）
  if (k.startsWith("sb_secret_") || k.toLowerCase().includes("service_role")) {
    return {
      ok: false,
      message:
        "检测到疑似服务端密钥 (sb_secret_ / service_role) 被写入 NEXT_PUBLIC_SUPABASE_ANON_KEY，" +
        "会随前端代码泄漏。请改填 Supabase 控制台提供的 anon public / publishable key。",
    };
  }
  const looksLikeLegacyJWT = k.startsWith("eyJ");
  const looksLikePublishableKey = k.startsWith("sb_publishable_") || k.startsWith("sb_");
  if (!looksLikeLegacyJWT && !looksLikePublishableKey) {
    return {
      ok: false,
      message:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY 看起来不是有效的 Supabase 客户端公钥。" +
        "请从 Supabase 控制台 → Project Settings → API 复制 anon public / publishable key" +
        "（新版以 sb_publishable_ 开头，旧版是 eyJ 开头的 JWT；不要用 service_role）。",
    };
  }
  return { ok: true };
}

const validation = validate();

if (typeof window !== "undefined" && !validation.ok) {
  // eslint-disable-next-line no-console
  console.error("[supabase] 配置无效：", validation.message);
}

export const supabaseConfig = {
  url: NEXT_PUBLIC_SUPABASE_URL,
  anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
  validation,
};

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClientOrThrow(): SupabaseClient {
  if (!validation.ok) throw new Error(validation.message);
  if (!cachedClient) {
    cachedClient = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: typeof window !== "undefined" },
    });
  }
  return cachedClient;
}

export const supabaseClient: SupabaseClient | null = validation.ok
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: typeof window !== "undefined" },
    })
  : null;
