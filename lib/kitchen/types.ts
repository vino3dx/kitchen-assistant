/** 菜谱中的单项食材。 */
export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string;
  note?: string;
}

/** 菜谱的烹饪步骤。 */
export interface CookingStep {
  step: number;
  title: string;
  content: string;
  tip?: string;
}

/** recipes 表对应的业务类型。 */
export interface Recipe {
  id: string;
  name: string;
  category: string;
  description?: string;
  prep_time?: string;
  difficulty?: string;
  image?: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  created_at?: string;
}

/** orders 表对应的业务类型。 */
export interface Order {
  id: string;
  family_id: string;
  recipe_id: string;
  recipe_name?: string;
  user_name: string;
  servings?: number;
  created_at?: string;
  recipe?: Recipe;
}

export interface Family {
  id: string;
  family_code: string;
  created_at?: string;
}

/** shopping 表中的原始采购记录（兼容项目当前表名）。 */
export interface ShoppingItem {
  id: string;
  name: string;
  unit?: string;
  quantity?: number | null;
  quantityStr?: string;
  checked: boolean;
  type?: "ingredient" | "extra" | string;
  created_at?: string;
}

/** 由订单食材聚合后的采购项。 */
export interface MergedShoppingItem {
  id: string;
  name: string;
  totalQuantity: number | null;
  unit: string;
  isApproximate: boolean;
  checked: boolean;
  category?: string;
  sources: Array<{ dishName: string; userName: string; quantity: number | null; unit: string; note?: string }>;
}

export interface ExtraShoppingItem extends ShoppingItem {
  quantityStr: string;
  type: "extra";
}

export type RecipeInsert = Omit<Recipe, "id" | "created_at"> & { id?: string; created_at?: string };
export type OrderInsert = Pick<Order, "family_id" | "recipe_id" | "user_name"> & Partial<Pick<Order, "servings">>;
