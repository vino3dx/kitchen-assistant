import { getSupabaseClientOrThrow } from "@/lib/supabase";
import type { ExtraShoppingItem, ShoppingItem } from "./types";

export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("shopping")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`获取采购清单失败：${error.message}`);
  return (data ?? []) as ShoppingItem[];
}

export async function updateShoppingChecked(id: string, checked: boolean): Promise<ShoppingItem> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("shopping")
    .update({ checked })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`更新采购项失败：${error.message}`);
  return data as ShoppingItem;
}

export async function createExtraShoppingItem(
  name: string,
  quantityStr = "1份"
): Promise<ExtraShoppingItem> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("shopping")
    .insert({
      type: "extra",
      name: name.trim(),
      quantityStr: quantityStr.trim() || "1份",
      checked: false,
    })
    .select()
    .single();
  if (error) throw new Error(`添加补录采购项失败：${error.message}`);
  return data as ExtraShoppingItem;
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase.from("shopping").delete().eq("id", id);
  if (error) throw new Error(`删除采购项失败：${error.message}`);
}
