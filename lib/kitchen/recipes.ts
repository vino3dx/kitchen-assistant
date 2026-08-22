import { getSupabaseClientOrThrow } from "@/lib/supabase";
import type { Recipe, RecipeInsert } from "./types";

export async function fetchRecipes(): Promise<Recipe[]> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("recipes")
    .select(`*, recipe_ingredients (*), recipe_steps (*)`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase 查询菜谱失败:", error);
    throw new Error(`获取菜谱失败：${error.message}`);
  }
  if (!data || data.length === 0) return [];

  return (data as any[]).map((row) => ({
    ...row,
    name: row.title || row.name || "未命名菜谱",
    prep_time: row.cooking_time || row.prep_time || "未知",
    ingredients: (row.recipe_ingredients ?? []).map((i: any) => ({
      ...i,
      quantity: i.quantity ?? null,
    })),
    steps: (row.recipe_steps ?? []).map((s: any) => ({
      ...s,
      step: s.step_number ?? s.step,
    })),
  }));
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`查询菜谱失败：${error.message}`);
  return (data as Recipe | null) ?? null;
}

export async function createRecipe(recipe: RecipeInsert): Promise<Recipe> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase.from("recipes").insert(recipe).select().single();
  if (error) throw new Error(`新增菜谱失败：${error.message}`);
  return data as Recipe;
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase
    .from("recipes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`更新菜谱失败：${error.message}`);
  return data as Recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = getSupabaseClientOrThrow();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(`删除菜谱失败：${error.message}`);
}
