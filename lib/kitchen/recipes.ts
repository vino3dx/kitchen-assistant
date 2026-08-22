import { supabaseClient } from "@/lib/supabase";
import type { Recipe, RecipeInsert } from "./types";

/** 获取全部菜谱（连表查询食材与步骤） */
export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabaseClient
    .from("recipes")
    .select(`
      *,
      recipe_ingredients (*),
      recipe_steps (*)
    `)
    .order("created_at", { ascending: false });

  console.log("Supabase 原始返回数据:", data, "错误信息:", error);

  if (error) {
    console.error("Supabase 查询失败:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn(" Supabase 返回了空数组，请确认 SQL 是否已成功运行并插入了数据。");
    return [];
  }

  // 格式化映射为前端要求的格式
  const formattedRecipes: Recipe[] = data.map((row: any) => ({
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

  console.log("最终格式化成功的菜谱列表 (数量):", formattedRecipes.length);
  return formattedRecipes;
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
