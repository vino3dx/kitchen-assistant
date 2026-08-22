import { supabaseClient } from "@/lib/supabase";
import type { Order, OrderInsert } from "./types";

/** 获取今日全部订单。 */
export async function fetchOrders(familyId: string): Promise<Order[]> {
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Order[];
}

/** 查找某位成员是否已点指定菜品。 */
export async function findOrder(familyId: string, recipeId: string, userName: string): Promise<Order | null> {
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .eq("family_id", familyId)
    .eq("recipe_id", recipeId)
    .eq("user_name", userName)
    .maybeSingle();
  if (error) throw error;
  return (data as Order | null) ?? null;
}

/** 新增订单。 */
export async function createOrder(order: OrderInsert): Promise<Order> {
  const { data, error } = await supabaseClient.from("orders").insert(order).select().single();
  if (error) throw error;
  return data as Order;
}

/** 删除单个订单。 */
export async function deleteOrder(familyId: string, id: string): Promise<void> {
  const { error } = await supabaseClient.from("orders").delete().eq("family_id", familyId).eq("id", id);
  if (error) throw error;
}

/** 清空订单表。 */
export async function clearOrders(familyId: string): Promise<void> {
  const { error } = await supabaseClient.from("orders").delete().eq("family_id", familyId);
  if (error) throw error;
}
