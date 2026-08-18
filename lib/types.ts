export interface Ingredient {
  name: string;
  quantity: number | null; // e.g. 2, 3, 500, or null for "适量"
  unit: string; // e.g. "个", "根", "克", "勺", "瓣", "适量"
  note?: string; // e.g. "切厚片", "去皮切丁"
}

export interface CookingStep {
  step: number;
  title: string;
  content: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: "热菜" | "凉菜" | "素菜" | "荤菜" | "汤羹" | "主食" | string;
  description?: string;
  prep_time?: string; // e.g. "15分钟"
  difficulty?: "简单" | "中等" | "稍难";
  image?: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  created_at?: string;
}

export interface MealOrder {
  id: string;
  recipe_id: string;
  recipe_name: string;
  user_name: string;
  servings?: number;
  created_at: string;
  recipe?: Recipe;
}

export interface MergedShoppingItem {
  id: string;
  name: string;
  totalQuantity: number | null;
  unit: string;
  isApproximate: boolean; // whether quantity is "适量"
  sources: Array<{
    dishName: string;
    userName: string;
    quantity: number | null;
    unit: string;
    note?: string;
  }>;
  checked: boolean;
  category?: string; // "蔬菜豆菇", "肉禽蛋品", "水产海鲜", "调味干货", "其他"
}

export interface ExtraShoppingItem {
  id: string;
  name: string;
  quantityStr: string;
  checked: boolean;
  created_at: string;
}
