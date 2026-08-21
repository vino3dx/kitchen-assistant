import { supabaseClient } from "@/lib/supabase";
import type { ExtraShoppingItem, ShoppingItem } from "./types";

/** 查询采购记录；项目当前 Supabase 表名为 shopping。 */
export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabaseClient.from("shopping").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ShoppingItem[];
}

/** 更新采购项勾选状态。 */
export async function updateShoppingChecked(id: string, checked: boolean): Promise<ShoppingItem> {
  const { data, error } = await supabaseClient.from("shopping").update({ checked }).eq("id", id).select().single();
  if (error) throw error;
  return data as ShoppingItem;
}

/** 添加补录采购项。 */
export async function createExtraShoppingItem(name: string, quantityStr = "1份"): Promise<ExtraShoppingItem> {
  const { data, error } = await supabaseClient.from("shopping").insert({ type: "extra", name: name.trim(), quantityStr: quantityStr.trim() || "1份", checked: false }).select().single();
  if (error) throw error;
  return data as ExtraShoppingItem;
}

/** 删除补录采购项。 */
export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabaseClient.from("shopping").delete().eq("id", id);
  if (error) throw error;
}
