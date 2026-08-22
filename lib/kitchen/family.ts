import { getSupabaseClientOrThrow } from "@/lib/supabase";

export const FAMILY_ID_STORAGE_KEY = "kitchen_family_id";
export const FAMILY_CODE_STORAGE_KEY = "kitchen_family_code";
const FAMILY_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const FAMILY_CODE_LENGTH = 5;

export interface Family {
  id: string;
  family_code: string;
  created_at?: string;
}

export function generateFamilyCode(): string {
  let code = "";
  for (let index = 0; index < FAMILY_CODE_LENGTH; index += 1) {
    code += FAMILY_CODE_ALPHABET[Math.floor(Math.random() * FAMILY_CODE_ALPHABET.length)];
  }
  return code;
}

export function getStoredFamily(): { familyId: string | null; familyCode: string | null } {
  if (typeof window === "undefined") return { familyId: null, familyCode: null };
  return {
    familyId: window.localStorage.getItem(FAMILY_ID_STORAGE_KEY),
    familyCode: window.localStorage.getItem(FAMILY_CODE_STORAGE_KEY),
  };
}

export function saveFamilyToStorage(familyId: string, familyCode: string) {
  window.localStorage.setItem(FAMILY_ID_STORAGE_KEY, familyId);
  window.localStorage.setItem(FAMILY_CODE_STORAGE_KEY, familyCode);
  window.dispatchEvent(new Event("kitchen-family-change"));
}

export function clearFamilyStorage() {
  window.localStorage.removeItem(FAMILY_ID_STORAGE_KEY);
  window.localStorage.removeItem(FAMILY_CODE_STORAGE_KEY);
  window.dispatchEvent(new Event("kitchen-family-change"));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    // Supabase/PostgREST 错误常是 { code, message, details, hint } 的对象
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
  }
  if (typeof error === "string") return error;
  try {
    const s = JSON.stringify(error);
    if (s && s !== "{}") return s;
  } catch {
    // ignore
  }
  return "";
}

function getErrorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.code === "string") return obj.code;
  }
  return "";
}

function humanizeError(error: unknown, fallback: string): string {
  const msg = getErrorMessage(error);
  const code = getErrorCode(error);
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    return `${fallback}：网络请求失败，请检查 NEXT_PUBLIC_SUPABASE_URL 是否可访问、是否被 CORS 拦截。`;
  }
  if (msg.includes("JWT") || msg.includes("401") || msg.includes("Unauthorized") || msg.includes("invalid JWT")) {
    return `${fallback}：鉴权失败，请确认 NEXT_PUBLIC_SUPABASE_ANON_KEY 是 anon public / publishable key、且未过期。`;
  }
  if (msg.includes("404") || msg.includes("does not exist") || msg.includes('relation "families"')) {
    return `${fallback}：Supabase 中找不到 families 表，请先在 SQL Editor 运行建表脚本。`;
  }
  const isRls =
    msg.includes("new row violates row-level security policy") ||
    msg.includes("row-level security policy") ||
    msg.includes("insufficient_privilege") ||
    code === "42501";
  if (isRls) {
    const policySql =
      'alter table public.families enable row level security; ' +
      'create policy if not exists "families anon select" on public.families for select using (true); ' +
      'create policy if not exists "families anon insert" on public.families for insert with check (true);';
    return `${fallback}：families 表启用了 RLS，但缺少允许 anon 插入/读取的 policy。请在 Supabase SQL Editor 执行：${policySql}`;
  }
  if (msg.includes("duplicate key") || msg.includes("unique") || msg.includes("23505") || code === "23505") {
    return "DUPLICATE_FAMILY_CODE";
  }
  if (msg.trim()) return `${fallback}：${msg}`;
  return fallback;
}

export async function findFamilyByCode(familyCode: string): Promise<Family | null> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("families")
    .select("id,family_code,created_at")
    .eq("family_code", familyCode.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    const message = humanizeError(error, "查询家庭码失败");
    if (message === "DUPLICATE_FAMILY_CODE") throw new Error("查询家庭码失败：服务端返回重复码");
    throw new Error(message);
  }
  return (data as Family | null) ?? null;
}

export async function createFamilyRecord(familyCode = generateFamilyCode()): Promise<Family> {
  const supabase = getSupabaseClientOrThrow();
  const normalizedCode = familyCode.trim().toUpperCase();

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = attempt === 0 ? normalizedCode : generateFamilyCode();
    try {
      const { data, error } = await supabase
        .from("families")
        .insert({ family_code: code })
        .select("id,family_code,created_at")
        .single();
      if (error) throw error;
      return data as Family;
    } catch (e) {
      const message = humanizeError(e, "创建家庭失败");
      if (message === "DUPLICATE_FAMILY_CODE") {
        lastError = e;
        continue;
      }
      throw new Error(message);
    }
  }

  const message = humanizeError(lastError, "创建家庭失败");
  throw new Error(
    message === "DUPLICATE_FAMILY_CODE"
      ? "创建家庭失败：连续生成家庭码都已被占用，请稍后再试"
      : message
  );
}
