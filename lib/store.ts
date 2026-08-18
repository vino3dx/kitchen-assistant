import { DEFAULT_RECIPES } from "./default-recipes";
import { ExtraShoppingItem, MealOrder, MergedShoppingItem, Recipe } from "./types";

// In-memory global store to guarantee rock-solid availability across API routes
class KitchenDataStore {
  private recipes: Recipe[] = [...DEFAULT_RECIPES];
  private mealOrders: MealOrder[] = [
    {
      id: "order-1",
      recipe_id: "recipe-tomato-egg",
      recipe_name: "番茄炒鸡蛋",
      user_name: "爸爸",
      servings: 1,
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "order-2",
      recipe_id: "recipe-fried-eggplant",
      recipe_name: "炒茄子",
      user_name: "妈妈",
      servings: 1,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ];
  private extraItems: ExtraShoppingItem[] = [];
  private checkedShoppingKeys: Set<string> = new Set(); // Stores key `name_unit` for checked status

  // --- Recipes ---
  public getRecipes(): Recipe[] {
    return [...this.recipes];
  }

  public getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find((r) => r.id === id);
  }

  public addRecipe(recipe: Omit<Recipe, "id"> & { id?: string }): Recipe {
    const newRecipe: Recipe = {
      ...recipe,
      id: recipe.id || `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      created_at: recipe.created_at || new Date().toISOString(),
    };
    this.recipes = [newRecipe, ...this.recipes];
    return newRecipe;
  }

  public updateRecipe(id: string, updates: Partial<Recipe>): Recipe | null {
    const idx = this.recipes.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.recipes[idx] = { ...this.recipes[idx], ...updates };
    return this.recipes[idx];
  }

  public deleteRecipe(id: string): boolean {
    const initialLen = this.recipes.length;
    this.recipes = this.recipes.filter((r) => r.id !== id);
    // Also remove from orders
    this.mealOrders = this.mealOrders.filter((o) => o.recipe_id !== id);
    return this.recipes.length < initialLen;
  }

  // --- Meal Orders (Today's Menu) ---
  public getMealOrders(): MealOrder[] {
    return this.mealOrders.map((order) => {
      const recipe = this.getRecipeById(order.recipe_id);
      return {
        ...order,
        recipe: recipe || {
          id: order.recipe_id,
          name: order.recipe_name,
          category: "热菜",
          ingredients: [],
          steps: [],
        },
      };
    });
  }

  public addMealOrder(recipeId: string, userName: string): MealOrder {
    const recipe = this.getRecipeById(recipeId);
    const recipeName = recipe ? recipe.name : "未知菜品";
    
    // Check if same dish already added by anyone or update
    const newOrder: MealOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipe_id: recipeId,
      recipe_name: recipeName,
      user_name: userName || "家庭成员",
      servings: 1,
      created_at: new Date().toISOString(),
      recipe,
    };
    this.mealOrders = [newOrder, ...this.mealOrders];
    return newOrder;
  }

  public removeMealOrder(orderId: string): boolean {
    const initialLen = this.mealOrders.length;
    this.mealOrders = this.mealOrders.filter((o) => o.id !== orderId);
    return this.mealOrders.length < initialLen;
  }

  public removeMealOrderByRecipeId(recipeId: string, userName?: string): boolean {
    const initialLen = this.mealOrders.length;
    if (userName) {
      this.mealOrders = this.mealOrders.filter(
        (o) => !(o.recipe_id === recipeId && o.user_name === userName)
      );
    } else {
      this.mealOrders = this.mealOrders.filter((o) => o.recipe_id !== recipeId);
    }
    return this.mealOrders.length < initialLen;
  }

  public clearMealOrders(): void {
    this.mealOrders = [];
    this.checkedShoppingKeys.clear();
  }

  // --- Merged Shopping List Calculation ---
  public getMergedShoppingList(): MergedShoppingItem[] {
    const activeOrders = this.getMealOrders();
    const map = new Map<string, MergedShoppingItem>();

    for (const order of activeOrders) {
      const recipe = order.recipe;
      if (!recipe || !recipe.ingredients) continue;

      for (const ing of recipe.ingredients) {
        const cleanName = ing.name.trim();
        const cleanUnit = (ing.unit || "适量").trim();
        // Aggregation key: name + unit (e.g. "番茄_个", "大蒜_瓣")
        const key = `${cleanName}_${cleanUnit}`;

        if (!map.has(key)) {
          map.set(key, {
            id: `item-${cleanName}-${cleanUnit}`,
            name: cleanName,
            totalQuantity: typeof ing.quantity === "number" ? ing.quantity : null,
            unit: cleanUnit,
            isApproximate: typeof ing.quantity !== "number" || cleanUnit === "适量",
            sources: [
              {
                dishName: recipe.name,
                userName: order.user_name,
                quantity: ing.quantity,
                unit: cleanUnit,
                note: ing.note,
              },
            ],
            checked: this.checkedShoppingKeys.has(key),
          });
        } else {
          const item = map.get(key)!;
          if (typeof ing.quantity === "number" && typeof item.totalQuantity === "number") {
            item.totalQuantity += ing.quantity;
          } else if (typeof ing.quantity === "number" && item.totalQuantity === null) {
            item.totalQuantity = ing.quantity;
          }
          item.sources.push({
            dishName: recipe.name,
            userName: order.user_name,
            quantity: ing.quantity,
            unit: cleanUnit,
            note: ing.note,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      // Sort unchecked first, then by name
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.name.localeCompare(b.name, "zh-CN");
    });
  }

  public toggleShoppingItemCheck(itemName: string, unit: string, checked?: boolean): boolean {
    const key = `${itemName.trim()}_${(unit || "适量").trim()}`;
    const willBeChecked = checked !== undefined ? checked : !this.checkedShoppingKeys.has(key);
    if (willBeChecked) {
      this.checkedShoppingKeys.add(key);
    } else {
      this.checkedShoppingKeys.delete(key);
    }
    return willBeChecked;
  }

  // --- Extra Items ---
  public getExtraShoppingItems(): ExtraShoppingItem[] {
    return [...this.extraItems];
  }

  public addExtraShoppingItem(name: string, quantityStr: string): ExtraShoppingItem {
    const item: ExtraShoppingItem = {
      id: `extra-${Date.now()}`,
      name: name.trim(),
      quantityStr: (quantityStr || "1份").trim(),
      checked: false,
      created_at: new Date().toISOString(),
    };
    this.extraItems = [item, ...this.extraItems];
    return item;
  }

  public toggleExtraItem(id: string): boolean {
    const item = this.extraItems.find((i) => i.id === id);
    if (item) {
      item.checked = !item.checked;
      return true;
    }
    return false;
  }

  public deleteExtraItem(id: string): boolean {
    const initialLen = this.extraItems.length;
    this.extraItems = this.extraItems.filter((i) => i.id !== id);
    return this.extraItems.length < initialLen;
  }
}

// Global singleton instance
const globalForKitchen = globalThis as unknown as { kitchenStore: KitchenDataStore };

export const store = globalForKitchen.kitchenStore || new KitchenDataStore();

if (process.env.NODE_ENV !== "production") {
  globalForKitchen.kitchenStore = store;
}
