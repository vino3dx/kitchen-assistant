"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChefHat,
  Plus,
  Trash2,
  Edit3,
  Search,
  BookOpen,
  Sparkles,
  Clock,
  Flame,
  X,
  Check,
} from "lucide-react";
import { Recipe, Ingredient, CookingStep } from "@/lib/types";

export default function AdminRecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  // Modal for creating / editing
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("热菜");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formPrepTime, setFormPrepTime] = useState<string>("15分钟");
  const [formDifficulty, setFormDifficulty] = useState<"简单" | "中等" | "稍难">("简单");
  const [formIngredients, setFormIngredients] = useState<Ingredient[]>([
    { name: "", quantity: null, unit: "个", note: "" },
  ]);
  const [formSteps, setFormSteps] = useState<CookingStep[]>([
    { step: 1, title: "", content: "", tip: "" },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch("/api/recipes").then((r) => r.json());
      if (res.success && res.data) {
        setRecipes(res.data);
      }
    } catch (err) {
      console.error("获取菜谱列表失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/recipes").then((r) => r.json());
        if (!ignore && res.success && res.data) {
          setRecipes(res.data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Open modal for new recipe
  const handleOpenAddModal = () => {
    setEditingRecipeId(null);
    setFormName("");
    setFormCategory("热菜");
    setFormDesc("");
    setFormPrepTime("15分钟");
    setFormDifficulty("简单");
    setFormIngredients([
      { name: "主料1", quantity: 2, unit: "个", note: "切块" },
      { name: "大蒜", quantity: 3, unit: "瓣", note: "切末" },
      { name: "食用油", quantity: 15, unit: "ml", note: "适量" },
      { name: "食用盐", quantity: 3, unit: "克", note: "适量" },
    ]);
    setFormSteps([
      { step: 1, title: "食材准备", content: "洗净食材并改刀备用。", tip: "" },
      { step: 2, title: "下锅煸炒", content: "热锅倒油，爆香蒜末后下入主料翻炒。", tip: "" },
      { step: 3, title: "调味出锅", content: "加入适量盐和调料翻炒均匀即可出锅。", tip: "" },
    ]);
    setIsModalOpen(true);
  };

  // Open modal for editing recipe
  const handleOpenEditModal = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setFormName(recipe.name);
    setFormCategory(recipe.category);
    setFormDesc(recipe.description || "");
    setFormPrepTime(recipe.prep_time || "15分钟");
    setFormDifficulty(recipe.difficulty || "简单");
    setFormIngredients(
      recipe.ingredients && recipe.ingredients.length > 0
        ? JSON.parse(JSON.stringify(recipe.ingredients))
        : [{ name: "", quantity: null, unit: "个", note: "" }]
    );
    setFormSteps(
      recipe.steps && recipe.steps.length > 0
        ? JSON.parse(JSON.stringify(recipe.steps))
        : [{ step: 1, title: "", content: "", tip: "" }]
    );
    setIsModalOpen(true);
  };

  // Save recipe (POST or PUT)
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("请输入菜谱名称");
      return;
    }

    const cleanedIngredients = formIngredients.filter((ing) => ing.name.trim() !== "");
    const cleanedSteps = formSteps
      .filter((st) => st.title.trim() !== "" || st.content.trim() !== "")
      .map((st, idx) => ({ ...st, step: idx + 1 }));

    const payload = {
      name: formName.trim(),
      category: formCategory,
      description: formDesc.trim(),
      prep_time: formPrepTime.trim(),
      difficulty: formDifficulty,
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
    };

    try {
      if (editingRecipeId) {
        // PUT
        const res = await fetch(`/api/recipes/${editingRecipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => r.json());

        if (res.success) {
          showToast(`「${formName}」更新成功`);
          setIsModalOpen(false);
          fetchRecipes();
        } else {
          alert(res.error || "保存失败");
        }
      } else {
        // POST
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => r.json());

        if (res.success) {
          showToast(`「${formName}」添加成功`);
          setIsModalOpen(false);
          fetchRecipes();
        } else {
          alert(res.error || "添加失败");
        }
      }
    } catch (err) {
      console.error("保存菜谱失败:", err);
      alert("保存失败，请重试");
    }
  };

  // Delete recipe
  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!window.confirm(`确定要删除菜谱「${recipe.name}」吗？`)) return;

    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" }).then((r) =>
        r.json()
      );
      if (res.success) {
        showToast(`已删除「${recipe.name}」`);
        fetchRecipes();
      } else {
        alert(res.error || "删除失败");
      }
    } catch (err) {
      console.error("删除菜谱失败:", err);
    }
  };

  // Ingredient helpers
  const handleAddIngredientRow = () => {
    setFormIngredients([...formIngredients, { name: "", quantity: 1, unit: "个", note: "" }]);
  };
  const handleRemoveIngredientRow = (idx: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== idx));
  };
  const handleIngredientChange = (idx: number, field: keyof Ingredient, val: unknown) => {
    const next = [...formIngredients];
    next[idx] = { ...next[idx], [field]: val };
    setFormIngredients(next);
  };

  // Step helpers
  const handleAddStepRow = () => {
    setFormSteps([
      ...formSteps,
      { step: formSteps.length + 1, title: "", content: "", tip: "" },
    ]);
  };
  const handleRemoveStepRow = (idx: number) => {
    const next = formSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
    setFormSteps(next);
  };
  const handleStepChange = (idx: number, field: keyof CookingStep, val: unknown) => {
    const next = [...formSteps];
    next[idx] = { ...next[idx], [field]: val };
    setFormSteps(next);
  };

  // Filter recipes
  const filteredRecipes = recipes.filter((r) => {
    const matchCat = selectedCategory === "全部" || r.category === selectedCategory;
    const matchQuery =
      !searchQuery.trim() ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="返回点菜/买菜/做菜"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <span>家庭菜谱库管理</span>
              </h1>
              <p className="text-xs text-stone-500">维护家庭常吃菜谱、食材清单与制作步骤</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新增菜谱</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索菜谱名或描述..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["全部", "热菜", "素菜", "荤菜", "汤羹", "凉菜"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Table / Card list */}
        {isLoading ? (
          <div className="py-12 text-center text-stone-400 text-sm">加载菜谱库中...</div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
            <p className="text-sm font-medium text-stone-700">没有找到相关菜谱</p>
            <button
              onClick={handleOpenAddModal}
              className="text-xs text-orange-600 font-semibold hover:underline"
            >
              立即新增一道新菜谱
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRecipes.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900">{r.name}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          {r.category}
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-xs text-stone-500 mt-1">{r.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(r)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                        title="编辑菜谱"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(r)}
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
                        title="删除菜谱"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ingredients preview */}
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-stone-500 mb-1">
                      食材 ({r.ingredients.length} 样):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 bg-stone-50 text-stone-700 rounded border border-stone-200"
                        >
                          {ing.name} {ing.quantity ? `${ing.quantity}${ing.unit}` : ing.unit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps preview count */}
                  <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-3">
                    <span>步骤: {r.steps.length} 步</span>
                    {r.prep_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {r.prep_time}
                      </span>
                    )}
                    {r.difficulty && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        {r.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" />
                <span>{editingRecipeId ? "编辑菜谱" : "新增家常菜谱"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    菜谱名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="如：麻婆豆腐、红烧带鱼"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">分类</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="热菜">热菜</option>
                    <option value="素菜">素菜</option>
                    <option value="荤菜">荤菜</option>
                    <option value="汤羹">汤羹</option>
                    <option value="凉菜">凉菜</option>
                    <option value="主食">主食</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">一句话描述</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="如：鲜香麻辣，下饭一绝"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">烹饪耗时</label>
                  <input
                    type="text"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    placeholder="如：15分钟"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">烹饪难度</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) =>
                      setFormDifficulty(e.target.value as "简单" | "中等" | "稍难")
                    }
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="简单">简单</option>
                    <option value="中等">中等</option>
                    <option value="稍难">稍难</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Ingredients Section */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    所需食材与用量 (自动合并计算的核心依据)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加一行食材</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="食材名 (如: 番茄)"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                        className="flex-2 px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="数量 (如: 2)"
                        value={ing.quantity !== null ? ing.quantity : ""}
                        onChange={(e) =>
                          handleIngredientChange(
                            idx,
                            "quantity",
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-20 px-2 py-1.5 text-xs border border-stone-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="单位 (个/克/瓣/适量)"
                        value={ing.unit}
                        onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                        className="w-24 px-2 py-1.5 text-xs border border-stone-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="备注 (如: 切丁)"
                        value={ing.note || ""}
                        onChange={(e) => handleIngredientChange(idx, "note", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                      />
                      {formIngredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(idx)}
                          className="p-1 text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Cooking Steps Section */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">制作步骤</label>
                  <button
                    type="button"
                    onClick={handleAddStepRow}
                    className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加一步</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formSteps.map((st, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-700">第 {idx + 1} 步</span>
                        {formSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStepRow(idx)}
                            className="text-stone-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="步骤小标题 (如: 鸡蛋打散)"
                        value={st.title}
                        onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-medium"
                      />
                      <textarea
                        rows={2}
                        placeholder="具体操作说明..."
                        value={st.content}
                        onChange={(e) => handleStepChange(idx, "content", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="小贴士 (选填)"
                        value={st.tip || ""}
                        onChange={(e) => handleStepChange(idx, "tip", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px] text-amber-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form submit footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>保存菜谱</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
