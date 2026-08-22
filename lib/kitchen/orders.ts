import { getSupabaseClientOrThrow } from "@/lib/supabase";
import type { Order, OrderInsert } from "./types";

export async function fetchOrders(familyId: string): Promise<Order[]> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`获取订单失败：${error.message}`);
  return (data ?? []) as Order[];
}

export async function findOrder(
  familyId: string,
  recipeId: string,
  userName: string
): Promise<Order | null> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("family_id", familyId)
    .eq("recipe_id", recipeId)
    .eq("user_name", userName)
    .maybeSingle();
  if (error) throw new Error(`查询订单失败：${error.message}`);
  return (data as Order | null) ?? null;
}

export async function createOrder(order: OrderInsert): Promise<Order> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase.from("orders").insert(order).select().single();
  if (error) throw new Error(`新增订单失败：${error.message}`);
  return data as Order;
}

export async function deleteOrder(familyId: string, id: string): Promise<void> {
  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase.from("orders").delete().eq("family_id", familyId).eq("id", id);
  if (error) throw new Error(`删除订单失败：${error.message}`);
}

export async function clearOrders(familyId: string): Promise<void> {
  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase.from("orders").delete().eq("family_id", familyId);
  if (error) throw new Error(`清空订单失败：${error.message}`);
}
