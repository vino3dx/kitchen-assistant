import { supabaseClient } from "@/lib/supabase";

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
    const randomIndex = Math.floor(Math.random() * FAMILY_CODE_ALPHABET.length);
    code += FAMILY_CODE_ALPHABET[randomIndex];
  }
  return code;
}

export function getStoredFamily(): { familyId: string | null; familyCode: string | null } {
  if (typeof window === "undefined") {
    return { familyId: null, familyCode: null };
  }

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

export async function findFamilyByCode(familyCode: string): Promise<Family | null> {
  const { data, error } = await supabaseClient
    .from("families")
    .select("id,family_code,created_at")
    .eq("family_code", familyCode.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return (data as Family | null) ?? null;
}

export async function createFamilyRecord(familyCode = generateFamilyCode()): Promise<Family> {
  const normalizedCode = familyCode.trim().toUpperCase();
  const { data, error } = await supabaseClient
    .from("families")
    .insert({ family_code: normalizedCode })
    .select("id,family_code,created_at")
    .single();

  if (error) throw error;
  return data as Family;
}
