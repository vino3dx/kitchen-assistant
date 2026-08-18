"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingCart,
  ChefHat,
  Plus,
  Check,
  Trash2,
  BookOpen,
  User,
  Users,
  Search,
  Sparkles,
  Clock,
  Flame,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
  X,
  PlusCircle,
  Soup,
  ListOrdered,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { Recipe, MealOrder, MergedShoppingItem, ExtraShoppingItem } from "@/lib/types";

const FAMILY_MEMBERS = [
  { id: "爸爸", name: "爸爸", avatar: "👨", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "妈妈", name: "妈妈", avatar: "👩", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { id: "孩子", name: "孩子", avatar: "👧", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "我", name: "我", avatar: "🧑", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "爷爷", name: "爷爷", avatar: "👴", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "奶奶", name: "奶奶", avatar: "👵", color: "bg-orange-100 text-orange-800 border-orange-200" },
];

const CATEGORIES = ["全部", "热菜", "素菜", "荤菜", "汤羹", "凉菜"];

export default function HomePage() {
  // Navigation tabs: 'order' (点菜) | 'shopping' (买菜) | 'cook' (做菜)
  const [activeTab, setActiveTab] = useState<"order" | "shopping" | "cook">("order");

  // User context
  const [currentMember, setCurrentMember] = useState<string>("爸爸");
  const [customNameInput, setCustomNameInput] = useState<string>("");
  const [showCustomName, setShowCustomName] = useState<boolean>(false);

  // Data states
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [mergedShoppingList, setMergedShoppingList] = useState<MergedShoppingItem[]>([]);
  const [extraShoppingItems, setExtraShoppingItems] = useState<ExtraShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  // Recipe detail modal
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  // Cooking state: active dish index and step check-offs
  const [selectedCookingDishId, setSelectedCookingDishId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [completedDishes, setCompletedDishes] = useState<Record<string, boolean>>({});

  // Extra shopping item input
  const [extraItemName, setExtraItemName] = useState<string>("");
  const [extraItemQuantity, setExtraItemQuantity] = useState<string>("");

  // Notification toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [recipesRes, ordersRes, shoppingRes] = await Promise.all([
          fetch("/api/recipes").then((r) => r.json()),
          fetch("/api/orders").then((r) => r.json()),
          fetch("/api/shopping").then((r) => r.json()),
        ]);
        if (!ignore) {
          if (recipesRes.success && recipesRes.data) setRecipes(recipesRes.data);
          if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
          if (shoppingRes.success && shoppingRes.data) {
            setMergedShoppingList(shoppingRes.data.mergedItems || []);
            setExtraShoppingItems(shoppingRes.data.extraItems || []);
          }
          setIsLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle toggling dish in today's menu
  const handleToggleDish = async (recipe: Recipe) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe.id,
          userName: currentMember,
          action: "toggle",
        }),
      }).then((r) => r.json());

      if (res.success) {
        setOrders(res.data);
        if (res.action === "added") {
          showToast(`已将「${recipe.name}」加入今日菜单！`);
        } else {
          showToast(`已从今日菜单移除「${recipe.name}」`);
        }
        // Refresh shopping list
        const shoppingRes = await fetch("/api/shopping").then((r) => r.json());
        if (shoppingRes.success && shoppingRes.data) {
          setMergedShoppingList(shoppingRes.data.mergedItems || []);
        }
      }
    } catch (err) {
      console.error("点菜操作失败:", err);
      showToast("操作失败，请重试");
    }
  };

  // Clear today's menu
  const handleClearOrders = async () => {
    if (!window.confirm("确定要清空今日的所有点菜吗？")) return;
    try {
      const res = await fetch("/api/orders?clearAll=true", { method: "DELETE" }).then((r) =>
        r.json()
      );
      if (res.success) {
        setOrders([]);
        setMergedShoppingList([]);
        setCompletedDishes({});
        setCompletedSteps({});
        showToast("已重置今日菜单");
      }
    } catch (err) {
      console.error("清空菜单失败:", err);
    }
  };

  // Toggle shopping item check
  const handleToggleShoppingItem = async (item: MergedShoppingItem) => {
    const nextChecked = !item.checked;
    // Optimistic UI update
    setMergedShoppingList((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: nextChecked } : i))
    );

    try {
      await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          name: item.name,
          unit: item.unit,
          checked: nextChecked,
        }),
      });
    } catch (err) {
      console.error("勾选采购项失败:", err);
    }
  };

  // Add extra shopping item
  const handleAddExtraItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraItemName.trim()) return;

    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_extra",
          name: extraItemName,
          quantityStr: extraItemQuantity || "1份",
        }),
      }).then((r) => r.json());

      if (res.success && res.extraItems) {
        setExtraShoppingItems(res.extraItems);
        setExtraItemName("");
        setExtraItemQuantity("");
        showToast(`已添加补录品「${extraItemName}」`);
      }
    } catch (err) {
      console.error("添加采购品失败:", err);
    }
  };

  // Toggle extra shopping item
  const handleToggleExtraItem = async (id: string) => {
    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_extra",
          id,
        }),
      }).then((r) => r.json());

      if (res.success && res.extraItems) {
        setExtraShoppingItems(res.extraItems);
      }
    } catch (err) {
      console.error("更新补录品失败:", err);
    }
  };

  // Delete extra shopping item
  const handleDeleteExtraItem = async (id: string) => {
    try {
      const res = await fetch(`/api/shopping?id=${id}`, { method: "DELETE" }).then((r) =>
        r.json()
      );
      if (res.success && res.extraItems) {
        setExtraShoppingItems(res.extraItems);
      }
    } catch (err) {
      console.error("删除补录品失败:", err);
    }
  };

  // Toggle cooking step completed
  const handleToggleCookingStep = (recipeId: string, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const currentList = prev[recipeId] || [];
      const isCompleted = currentList.includes(stepNumber);
      const nextList = isCompleted
        ? currentList.filter((s) => s !== stepNumber)
        : [...currentList, stepNumber];
      return { ...prev, [recipeId]: nextList };
    });
  };

  // Mark dish as cooked
  const handleMarkDishCooked = (recipeId: string) => {
    setCompletedDishes((prev) => {
      const newState = !prev[recipeId];
      if (newState) {
        showToast("🎉 这道菜大功告成，太棒了！");
      }
      return { ...prev, [recipeId]: newState };
    });
  };

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchCat = selectedCategory === "全部" || r.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.ingredients &&
          r.ingredients.some((ing) =>
            ing.name.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      return matchCat && matchQuery;
    });
  }, [recipes, selectedCategory, searchQuery]);

  // Unique ordered recipes
  const orderedRecipeMap = useMemo(() => {
    const map = new Map<string, { recipe: Recipe; orderedBy: string[]; count: number }>();
    for (const order of orders) {
      const fullRecipe = recipes.find((r) => r.id === order.recipe_id) || order.recipe;
      if (!fullRecipe) continue;
      if (!map.has(order.recipe_id)) {
        map.set(order.recipe_id, {
          recipe: fullRecipe,
          orderedBy: [order.user_name],
          count: 1,
        });
      } else {
        const item = map.get(order.recipe_id)!;
        if (!item.orderedBy.includes(order.user_name)) {
          item.orderedBy.push(order.user_name);
        }
        item.count += 1;
      }
    }
    return map;
  }, [orders, recipes]);

  const uniqueOrderedRecipes = useMemo(() => {
    return Array.from(orderedRecipeMap.values());
  }, [orderedRecipeMap]);

  // Active cooking recipe computed gracefully
  const effectiveCookingDishId =
    selectedCookingDishId || uniqueOrderedRecipes[0]?.recipe.id || null;

  const activeCookingRecipe = useMemo(() => {
    if (!effectiveCookingDishId) return uniqueOrderedRecipes[0]?.recipe || null;
    return (
      recipes.find((r) => r.id === effectiveCookingDishId) ||
      uniqueOrderedRecipes.find((u) => u.recipe.id === effectiveCookingDishId)?.recipe ||
      null
    );
  }, [effectiveCookingDishId, recipes, uniqueOrderedRecipes]);

  // Progress metrics
  const shoppingStats = useMemo(() => {
    const total = mergedShoppingList.length + extraShoppingItems.length;
    const completed =
      mergedShoppingList.filter((i) => i.checked).length +
      extraShoppingItems.filter((i) => i.checked).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [mergedShoppingList, extraShoppingItems]);

  const cookingStats = useMemo(() => {
    const total = uniqueOrderedRecipes.length;
    const completed = uniqueOrderedRecipes.filter((item) => completedDishes[item.recipe.id]).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [uniqueOrderedRecipes, completedDishes]);

  return (
    <div id="kitchen-app-root" className="min-h-screen bg-stone-50 text-stone-900 pb-28">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Branding */}
      <header id="kitchen-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-stone-900" style={{ width: "73.9375px" }}>厨房助手</h1>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium border border-amber-200" style={{ width: "61px" }}>
                  Kitchen Assistant
                </span>
              </div>
              <p className="text-xs text-stone-500">点菜 → 智能买菜清单 → 烹饪指南</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              id="btn-nav-admin"
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>菜谱库管理</span>
            </Link>
          </div>
        </div>

        {/* 3-Stage Tab Switcher */}
        <div className="max-w-4xl mx-auto px-4 pt-1 pb-2">
          <nav className="grid grid-cols-3 p-1 bg-stone-100/90 rounded-xl border border-stone-200 gap-1">
            <button
              id="tab-btn-order"
              onClick={() => setActiveTab("order")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "order"
                  ? "bg-white text-orange-600 shadow-xs border border-stone-200/70"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>1. 点菜</span>
              {uniqueOrderedRecipes.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                  {uniqueOrderedRecipes.length}
                </span>
              )}
            </button>

            <button
              id="tab-btn-shopping"
              onClick={() => setActiveTab("shopping")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "shopping"
                  ? "bg-white text-emerald-700 shadow-xs border border-stone-200/70"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>2. 买菜</span>
              {shoppingStats.total > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                    shoppingStats.percent === 100
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {shoppingStats.completed}/{shoppingStats.total}
                </span>
              )}
            </button>

            <button
              id="tab-btn-cook"
              onClick={() => setActiveTab("cook")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "cook"
                  ? "bg-white text-amber-700 shadow-xs border border-stone-200/70"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>3. 做菜</span>
              {cookingStats.total > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                    cookingStats.percent === 100
                      ? "bg-amber-100 text-amber-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {cookingStats.completed}/{cookingStats.total}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5">
        {/* ================= STAGE 1: 点菜 (ORDERING) ================= */}
        {activeTab === "order" && (
          <div id="section-order-view" className="space-y-6">
            {/* Multi-member switcher */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    当前点菜人
                  </span>
                </div>
                <button
                  onClick={() => setShowCustomName(!showCustomName)}
                  className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>自定义昵称</span>
                </button>
              </div>

              {showCustomName ? (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="输入您的昵称，如：二宝、姑姑"
                    className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => {
                      if (customNameInput.trim()) {
                        setCurrentMember(customNameInput.trim());
                        setShowCustomName(false);
                      }
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
                  >
                    确定
                  </button>
                  <button
                    onClick={() => setShowCustomName(false)}
                    className="px-2 py-2 text-stone-500 text-sm"
                  >
                    取消
                  </button>
                </div>
              ) : null}

              <div className="flex items-center gap-2 flex-wrap">
                {FAMILY_MEMBERS.map((m) => {
                  const isSelected = currentMember === m.name;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setCurrentMember(m.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-orange-500 text-white shadow-xs scale-105"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                      }`}
                    >
                      <span className="text-base">{m.avatar}</span>
                      <span>{m.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Today's Selected Menu Live Banner */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 rounded-2xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <h2 className="text-sm font-bold text-stone-900">
                    今日菜单 ({uniqueOrderedRecipes.length} 道菜)
                  </h2>
                </div>
                {uniqueOrderedRecipes.length > 0 && (
                  <button
                    onClick={handleClearOrders}
                    className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空菜单</span>
                  </button>
                )}
              </div>

              {uniqueOrderedRecipes.length === 0 ? (
                <div className="py-6 text-center text-stone-500 text-sm">
                  <p>今天还没有选菜哦！点击下方菜谱选择想吃的菜品 🍲</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {uniqueOrderedRecipes.map(({ recipe, orderedBy }) => (
                      <div
                        key={recipe.id}
                        className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs text-sm"
                      >
                        <span className="font-semibold text-stone-800">{recipe.name}</span>
                        <div className="flex items-center gap-1">
                          {orderedBy.map((user, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-medium"
                            >
                              {user}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleToggleDish(recipe)}
                          title="取消该菜品"
                          className="text-stone-400 hover:text-red-500 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary Bar & Direct Next Step Button */}
                  <div className="pt-3 mt-3 border-t border-amber-200/60 flex items-center justify-between">
                    <p className="text-xs text-stone-600">
                      点好菜了？系统将自动合并食材并生成采购清单！
                    </p>
                    <button
                      id="btn-goto-shopping"
                      onClick={() => setActiveTab("shopping")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all hover:gap-2"
                    >
                      <span>去买菜清单</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Pills & Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索菜名或食材，如：番茄、牛肉、茄子..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-stone-900 text-white font-semibold"
                        : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-700">
                  可选菜谱 ({filteredRecipes.length})
                </h3>
                <span className="text-xs text-stone-400">点击卡片查看做法详情</span>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-stone-400 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                  <span>正在加载菜谱...</span>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
                  <p>没有找到相关菜谱</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("全部");
                    }}
                    className="mt-2 text-xs text-orange-600 hover:underline"
                  >
                    重置筛选条件
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredRecipes.map((recipe) => {
                    const isOrderedByAnyone = orderedRecipeMap.has(recipe.id);
                    const orderDetail = orderedRecipeMap.get(recipe.id);
                    const isOrderedByMe =
                      orderDetail?.orderedBy.includes(currentMember) ?? false;

                    return (
                      <div
                        key={recipe.id}
                        className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                          isOrderedByAnyone
                            ? "border-orange-300 ring-1 ring-orange-200 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 hover:shadow-xs"
                        }`}
                      >
                        <div
                          onClick={() => setViewingRecipe(recipe)}
                          className="p-4 cursor-pointer flex-1"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                              {recipe.name}
                            </h4>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium whitespace-nowrap">
                              {recipe.category}
                            </span>
                          </div>

                          {recipe.description && (
                            <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                              {recipe.description}
                            </p>
                          )}

                          {/* Ingredient snippet */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-1.5 py-0.5 bg-stone-50 text-stone-600 rounded border border-stone-100"
                              >
                                {ing.name} {ing.quantity ? `${ing.quantity}${ing.unit}` : ing.unit}
                              </span>
                            ))}
                            {recipe.ingredients.length > 4 && (
                              <span className="text-[11px] text-stone-400 px-1 py-0.5">
                                +{recipe.ingredients.length - 4}样
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-stone-400">
                            {recipe.prep_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {recipe.prep_time}
                              </span>
                            )}
                            {recipe.difficulty && (
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-500" />
                                {recipe.difficulty}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="px-4 py-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs">
                            {isOrderedByAnyone ? (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-orange-700 font-semibold">已选：</span>
                                {orderDetail?.orderedBy.map((user, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-medium"
                                  >
                                    {user}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-stone-400">尚未加入菜单</span>
                            )}
                          </div>

                          <button
                            id={`btn-order-${recipe.id}`}
                            onClick={() => handleToggleDish(recipe)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isOrderedByMe
                                ? "bg-orange-600 text-white shadow-xs hover:bg-orange-700"
                                : isOrderedByAnyone
                                ? "bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300"
                                : "bg-stone-900 text-white hover:bg-black"
                            }`}
                          >
                            {isOrderedByMe ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>我也想吃 (已点)</span>
                              </>
                            ) : isOrderedByAnyone ? (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>我也想吃 +1</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>我想吃这道</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 2: 买菜清单 (GROCERY & MERGING) ================= */}
        {activeTab === "shopping" && (
          <div id="section-shopping-view" className="space-y-6">
            {/* Header summary banner */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-bold text-stone-900">今日采购清单</h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    系统根据今日 {uniqueOrderedRecipes.length} 道菜自动合并计算食材，去菜市场/超市直接照着买！
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-stone-400">采购进度</div>
                    <div className="text-lg font-black text-emerald-600">
                      {shoppingStats.completed} / {shoppingStats.total}
                    </div>
                  </div>
                  <button
                    id="btn-goto-cook"
                    onClick={() => setActiveTab("cook")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                  >
                    <span>买齐了，去掌勺做菜</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${shoppingStats.percent}%` }}
                />
              </div>
            </div>

            {/* If no dishes selected */}
            {uniqueOrderedRecipes.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <Soup className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="text-sm font-bold text-stone-800">今日菜单还是空的</h3>
                <p className="text-xs text-stone-500">
                  先去「点菜」选择想吃的菜品，系统将自动汇总需要买的所有食材。
                </p>
                <button
                  onClick={() => setActiveTab("order")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>现在去点菜</span>
                </button>
              </div>
            )}

            {/* Merged Ingredients List */}
            {mergedShoppingList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>智能合并食材清单 ({mergedShoppingList.length} 样)</span>
                  </h3>
                  <span className="text-xs text-stone-400">点击项目勾选完成</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mergedShoppingList.map((item) => {
                    const isChecked = item.checked;
                    const isMultiSource = item.sources.length > 1;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleShoppingItem(item)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                          isChecked
                            ? "bg-emerald-50/50 border-emerald-200 text-stone-400"
                            : "bg-white border-stone-200 hover:border-emerald-300 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-stone-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`text-sm font-bold ${
                                  isChecked ? "line-through text-stone-400" : "text-stone-900"
                                }`}
                              >
                                {item.name}
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  isChecked ? "text-emerald-700/60" : "text-emerald-700"
                                }`}
                              >
                                {item.totalQuantity !== null
                                  ? `${item.totalQuantity} ${item.unit}`
                                  : item.unit}
                              </span>
                            </div>

                            {/* Source breakdown explanation */}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.sources.map((src, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                    isChecked
                                      ? "bg-stone-100 text-stone-400 border-stone-200"
                                      : "bg-stone-50 text-stone-600 border-stone-200/80"
                                  }`}
                                >
                                  {src.dishName}
                                  {src.quantity ? ` (${src.quantity}${src.unit})` : ""}
                                </span>
                              ))}
                              {isMultiSource && (
                                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded font-medium">
                                  已合并 {item.sources.length} 道菜
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extra manual shopping items */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-orange-500" />
                  <span>临时补录其他采购项（调料/饮品/日用品）</span>
                </h3>
              </div>

              <form onSubmit={handleAddExtraItem} className="flex items-center gap-2">
                <input
                  type="text"
                  value={extraItemName}
                  onChange={(e) => setExtraItemName(e.target.value)}
                  placeholder="品名，如：特级生抽、冰镇可乐、纸巾"
                  className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={extraItemQuantity}
                  onChange={(e) => setExtraItemQuantity(e.target.value)}
                  placeholder="数量，如：1瓶、2提"
                  className="w-24 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl"
                >
                  添加
                </button>
              </form>

              {extraShoppingItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  {extraShoppingItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        item.checked
                          ? "bg-emerald-50/40 border-emerald-200 text-stone-400"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div
                        onClick={() => handleToggleExtraItem(item.id)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            item.checked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-stone-300 bg-white"
                          }`}
                        >
                          {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-sm ${
                            item.checked ? "line-through text-stone-400" : "font-medium"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-stone-500">({item.quantityStr})</span>
                      </div>

                      <button
                        onClick={() => handleDeleteExtraItem(item.id)}
                        className="text-stone-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 3: 做菜 (COOKING GUIDE) ================= */}
        {activeTab === "cook" && (
          <div id="section-cook-view" className="space-y-6">
            {/* Header progress overview */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-600" />
                    <h2 className="text-base font-bold text-stone-900">今日烹饪工作台</h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    分步查看每道菜所需的食材用量与制作步骤，清晰不慌乱。
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-stone-400">已做完</div>
                    <div className="text-lg font-black text-amber-600">
                      {cookingStats.completed} / {cookingStats.total} 道
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-4">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${cookingStats.percent}%` }}
                />
              </div>
            </div>

            {uniqueOrderedRecipes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <Soup className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="text-sm font-bold text-stone-800">还没有选择要做的菜品</h3>
                <p className="text-xs text-stone-500">
                  先在「点菜」页面选好今天吃什么，这里就会显示每道菜的详细做法和制作步骤。
                </p>
                <button
                  onClick={() => setActiveTab("order")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>去点菜</span>
                </button>
              </div>
            ) : (
              <>
                {/* Horizontal dish tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {uniqueOrderedRecipes.map(({ recipe }) => {
                    const isSelected = effectiveCookingDishId === recipe.id;
                    const isCooked = completedDishes[recipe.id];

                    return (
                      <button
                        key={recipe.id}
                        onClick={() => setSelectedCookingDishId(recipe.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap border ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : isCooked
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-white text-stone-700 hover:bg-stone-100 border-stone-200"
                        }`}
                      >
                        {isCooked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <UtensilsCrossed className="w-4 h-4" />
                        )}
                        <span>{recipe.name}</span>
                        {isCooked && <span className="text-xs opacity-80">(已完成)</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Active dish cooking detail sheet */}
                {activeCookingRecipe && (
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-6">
                    {/* Dish Title & Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-stone-900">
                            {activeCookingRecipe.name}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                            {activeCookingRecipe.category}
                          </span>
                        </div>
                        {activeCookingRecipe.description && (
                          <p className="text-xs text-stone-500 mt-1">
                            {activeCookingRecipe.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleMarkDishCooked(activeCookingRecipe.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          completedDishes[activeCookingRecipe.id]
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-stone-900 text-white hover:bg-black"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {completedDishes[activeCookingRecipe.id]
                            ? "已做好 (点击取消)"
                            : "这道菜做好了！"}
                        </span>
                      </button>
                    </div>

                    {/* Required ingredients box */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                      <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                        <span>本道菜食材用量清单</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {activeCookingRecipe.ingredients.map((ing, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between font-semibold text-stone-800">
                              <span>{ing.name}</span>
                              <span className="text-orange-600">
                                {ing.quantity ? `${ing.quantity} ${ing.unit}` : ing.unit}
                              </span>
                            </div>
                            {ing.note && (
                              <span className="text-[10px] text-stone-400 mt-0.5">{ing.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-Step cooking cards */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-stone-500" />
                        <span>制作步骤 ({activeCookingRecipe.steps.length} 步)</span>
                      </h4>

                      <div className="space-y-3">
                        {activeCookingRecipe.steps.map((stepItem) => {
                          const isStepCompleted = (
                            completedSteps[activeCookingRecipe.id] || []
                          ).includes(stepItem.step);

                          return (
                            <div
                              key={stepItem.step}
                              className={`p-4 rounded-xl border transition-all ${
                                isStepCompleted
                                  ? "bg-emerald-50/50 border-emerald-200"
                                  : "bg-white border-stone-200 hover:border-amber-300 shadow-xs"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      isStepCompleted
                                        ? "bg-emerald-600 text-white"
                                        : "bg-stone-900 text-white"
                                    }`}
                                  >
                                    {isStepCompleted ? <Check className="w-4 h-4" /> : stepItem.step}
                                  </div>

                                  <div>
                                    <h5
                                      className={`text-sm font-bold ${
                                        isStepCompleted
                                          ? "line-through text-stone-400"
                                          : "text-stone-900"
                                      }`}
                                    >
                                      {stepItem.title}
                                    </h5>
                                    <p
                                      className={`text-xs mt-1 leading-relaxed ${
                                        isStepCompleted ? "text-stone-400" : "text-stone-700"
                                      }`}
                                    >
                                      {stepItem.content}
                                    </p>
                                    {stepItem.tip && (
                                      <div className="mt-2 text-[11px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70 inline-flex items-center gap-1">
                                        <Info className="w-3 h-3 text-amber-600 shrink-0" />
                                        <span>小贴士: {stepItem.tip}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    handleToggleCookingStep(activeCookingRecipe.id, stepItem.step)
                                  }
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                                    isStepCompleted
                                      ? "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
                                      : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                                  }`}
                                >
                                  {isStepCompleted ? "已完成" : "完成此步"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-stone-200 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-stone-900">{viewingRecipe.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-medium">
                    {viewingRecipe.category}
                  </span>
                </div>
                {viewingRecipe.description && (
                  <p className="text-xs text-stone-500 mt-1">{viewingRecipe.description}</p>
                )}
              </div>
              <button
                onClick={() => setViewingRecipe(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                所需食材
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {viewingRecipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-stone-800">{ing.name}</span>
                    <span className="text-orange-600">
                      {ing.quantity ? `${ing.quantity}${ing.unit}` : ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                烹饪步骤
              </h4>
              <div className="space-y-2.5">
                {viewingRecipe.steps.map((st) => (
                  <div key={st.step} className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center">
                        {st.step}
                      </span>
                      <span>{st.title}</span>
                    </div>
                    <p className="text-stone-600 pl-5">{st.content}</p>
                    {st.tip && <p className="text-amber-700 text-[11px] pl-5">💡 提示: {st.tip}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewingRecipe(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  handleToggleDish(viewingRecipe);
                  setViewingRecipe(null);
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                {orderedRecipeMap.get(viewingRecipe.id)?.orderedBy.includes(currentMember)
                  ? "从今日菜单移除"
                  : "加入今日菜单"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
