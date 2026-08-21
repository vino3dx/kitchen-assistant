import { supabaseClient } from "@/lib/supabase";
import type { Recipe, RecipeInsert } from "./types";

/** 获取全部菜谱，按创建时间倒序返回。 */
export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabaseClient.from("recipes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Recipe[];
}

/** 按主键获取单个菜谱。 */
export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabaseClient.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Recipe | null) ?? null;
}

/** 新增菜谱并返回数据库生成的记录。 */
export async function createRecipe(recipe: RecipeInsert): Promise<Recipe> {
  const { data, error } = await supabaseClient.from("recipes").insert(recipe).select().single();
  if (error) throw error;
  return data as Recipe;
}

/** 更新菜谱字段。 */
export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  const { data, error } = await supabaseClient.from("recipes").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as Recipe;
}

/** 删除菜谱。 */
export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabaseClient.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
