"use client";

import { useMemo, useState } from "react";
import { CookingPanel } from "@/components/kitchen/cooking-panel";
import { KitchenHeader, type KitchenTab } from "@/components/kitchen/kitchen-header";
import { OrderPanel, type OrderedRecipe } from "@/components/kitchen/order-panel";
import { RecipeModal } from "@/components/kitchen/recipe-modal";
import { ShoppingPanel } from "@/components/kitchen/shopping-panel";
import { Toast } from "@/components/kitchen/toast";
import { useOrders } from "@/hooks/use-orders";
import { useRecipes } from "@/hooks/use-recipes";
import { useShopping } from "@/hooks/use-shopping";
import type { ExtraShoppingItem, MergedShoppingItem, Recipe } from "@/lib/kitchen/types";

const FAMILY_MEMBERS = [
  { id: "爸爸", name: "爸爸", avatar: "👨" }, { id: "妈妈", name: "妈妈", avatar: "👩" },
  { id: "孩子", name: "孩子", avatar: "👧" }, { id: "我", name: "我", avatar: "🧑" },
  { id: "爷爷", name: "爷爷", avatar: "👴" }, { id: "奶奶", name: "奶奶", avatar: "👵" },
];
const CATEGORIES = ["全部", "热菜", "素菜", "荤菜", "汤羹", "凉菜"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<KitchenTab>("order");
  const [currentMember, setCurrentMember] = useState("爸爸");
  const [customNameInput, setCustomNameInput] = useState("");
  const [showCustomName, setShowCustomName] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [selectedCookingDishId, setSelectedCookingDishId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [completedDishes, setCompletedDishes] = useState<Record<string, boolean>>({});
  const [extraItemName, setExtraItemName] = useState("");
  const [extraItemQuantity, setExtraItemQuantity] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const recipesState = useRecipes();
  const ordersState = useOrders();
  const shoppingState = useShopping();
  const toast = (message: string) => {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(null), 2500);
  };

  const orderedByRecipe = useMemo(() => {
    const result = new Map<string, OrderedRecipe>();
    for (const order of ordersState.orders) {
      const recipe = recipesState.recipes.find((item) => item.id === order.recipe_id) ?? order.recipe;
      if (!recipe) continue;
      const entry = result.get(recipe.id) ?? { recipe, orderedBy: [], count: 0 };
      if (!entry.orderedBy.includes(order.user_name)) entry.orderedBy.push(order.user_name);
      entry.count += 1;
      result.set(recipe.id, entry);
    }
    return result;
  }, [ordersState.orders, recipesState.recipes]);
  const orderedRecipes = useMemo(() => [...orderedByRecipe.values()], [orderedByRecipe]);
  const mergedShoppingList = useMemo(() => {
    const items = new Map<string, MergedShoppingItem>();
    for (const { recipe, orderedBy } of orderedRecipes) for (const ingredient of recipe.ingredients) {
      const name = ingredient.name.trim(), unit = (ingredient.unit || "适量").trim(), key = `${name}_${unit}`;
      const item = items.get(key) ?? { id: `item-${name}-${unit}`, name, unit, totalQuantity: null, isApproximate: false, checked: !!checkedIngredients[key], sources: [] };
      item.totalQuantity = typeof ingredient.quantity === "number" ? (item.totalQuantity ?? 0) + ingredient.quantity : item.totalQuantity;
      item.isApproximate ||= typeof ingredient.quantity !== "number" || unit === "适量";
      item.sources.push(...orderedBy.map((userName) => ({ dishName: recipe.name, userName, quantity: ingredient.quantity, unit, note: ingredient.note })));
      items.set(key, item);
    }
    return [...items.values()].sort((a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name, "zh-CN"));
  }, [checkedIngredients, orderedRecipes]);
  const extraShoppingItems = useMemo(() => shoppingState.shoppingItems.filter((item): item is ExtraShoppingItem => item.type === "extra") as ExtraShoppingItem[], [shoppingState.shoppingItems]);
  const shoppingStats = useMemo(() => stats([...mergedShoppingList, ...extraShoppingItems]), [mergedShoppingList, extraShoppingItems]);
  const cookingStats = useMemo(() => stats(orderedRecipes, (item) => completedDishes[item.recipe.id]), [completedDishes, orderedRecipes]);
  const selectedId = selectedCookingDishId ?? orderedRecipes[0]?.recipe.id ?? null;
  const activeRecipe = orderedRecipes.find(({ recipe }) => recipe.id === selectedId)?.recipe ?? null;

  async function toggleRecipe(recipe: Recipe) {
    try {
      const order = ordersState.orders.find((item) => item.recipe_id === recipe.id && item.user_name === currentMember);
      if (order) { await ordersState.removeOrder(order.id); toast(`已从今日菜单移除「${recipe.name}」`); }
      else { await ordersState.createOrder({ recipe_id: recipe.id, user_name: currentMember }); toast(`已将「${recipe.name}」加入今日菜单！`); }
    } catch { toast("操作失败，请重试"); }
  }
  async function clearOrders() {
    if (!window.confirm("确定要清空今日的所有点菜吗？")) return;
    try { await ordersState.clearOrders(); setCompletedDishes({}); setCompletedSteps({}); setCheckedIngredients({}); toast("已重置今日菜单"); } catch { toast("清空菜单失败，请重试"); }
  }
  async function addExtraItem(event: React.FormEvent) {
    event.preventDefault();
    if (!extraItemName.trim()) return;
    try { await shoppingState.addExtraItem(extraItemName, extraItemQuantity || "1份"); toast(`已添加补录品「${extraItemName}」`); setExtraItemName(""); setExtraItemQuantity(""); } catch { toast("添加采购品失败，请重试"); }
  }
  const toggleStep = (recipeId: string, step: number) => setCompletedSteps((items) => ({ ...items, [recipeId]: items[recipeId]?.includes(step) ? items[recipeId].filter((item) => item !== step) : [...(items[recipeId] ?? []), step] }));
  const toggleCooked = (recipeId: string) => setCompletedDishes((items) => { const completed = !items[recipeId]; if (completed) toast("🎉 这道菜大功告成，太棒了！"); return { ...items, [recipeId]: completed }; });

  return <div id="kitchen-app-root" className="min-h-screen bg-stone-50 text-stone-900 pb-28">
    <Toast message={toastMsg} />
    <KitchenHeader activeTab={activeTab} onTabChange={setActiveTab} orderCount={orderedRecipes.length} shopping={shoppingStats} cooking={cookingStats} />
    <main className="max-w-4xl mx-auto px-4 py-5">
      {activeTab === "order" && <OrderPanel members={FAMILY_MEMBERS} currentMember={currentMember} customNameInput={customNameInput} showCustomName={showCustomName} recipes={recipesState.recipes} orderedRecipes={orderedRecipes} orderedByRecipe={orderedByRecipe} categories={CATEGORIES} selectedCategory={recipesState.selectedCategory} searchQuery={recipesState.searchQuery} isLoading={recipesState.isLoading || ordersState.isLoading} onMemberChange={setCurrentMember} onCustomNameChange={setCustomNameInput} onShowCustomNameChange={setShowCustomName} onClearOrders={clearOrders} onTabChange={() => setActiveTab("shopping")} onSearchChange={recipesState.setSearchQuery} onCategoryChange={recipesState.setSelectedCategory} onViewRecipe={setViewingRecipe} onToggleRecipe={toggleRecipe} />}
      {activeTab === "shopping" && <ShoppingPanel dishCount={orderedRecipes.length} stats={shoppingStats} items={mergedShoppingList} extras={extraShoppingItems} extraName={extraItemName} extraQuantity={extraItemQuantity} onExtraNameChange={setExtraItemName} onExtraQuantityChange={setExtraItemQuantity} onAddExtra={addExtraItem} onToggleItem={(item) => setCheckedIngredients((items) => ({ ...items, [`${item.name}_${item.unit}`]: !item.checked }))} onToggleExtra={(id) => void shoppingState.toggleItemChecked(id).catch(() => toast("更新采购项失败，请重试"))} onDeleteExtra={(id) => void shoppingState.removeShoppingItem(id).catch(() => toast("删除采购项失败，请重试"))} onGoCook={() => setActiveTab("cook")} onGoOrder={() => setActiveTab("order")} />}
      {activeTab === "cook" && <CookingPanel orderedRecipes={orderedRecipes} activeRecipe={activeRecipe} selectedId={selectedId} completedDishes={completedDishes} completedSteps={completedSteps} stats={cookingStats} onSelect={setSelectedCookingDishId} onToggleStep={toggleStep} onToggleDish={toggleCooked} onGoOrder={() => setActiveTab("order")} />}
    </main>
    <RecipeModal recipe={viewingRecipe} isOrderedByCurrentMember={viewingRecipe ? orderedByRecipe.get(viewingRecipe.id)?.orderedBy.includes(currentMember) ?? false : false} onClose={() => setViewingRecipe(null)} onToggle={toggleRecipe} />
  </div>;
}

function stats<T>(items: T[], completed: (item: T) => boolean = (item) => "checked" in (item as object) && Boolean((item as { checked: boolean }).checked)) {
  const total = items.length, done = items.filter(completed).length;
  return { total, completed: done, percent: total ? Math.round((done / total) * 100) : 0 };
}
