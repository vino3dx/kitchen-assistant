"use client";

import { ArrowRight, Check, RefreshCw, Search, Sparkles, Trash2, User, Users, X } from "lucide-react";
import type { Recipe } from "@/lib/kitchen/types";
import { RecipeCard } from "./recipe-card";

/** 已点菜品的聚合类型定义 */
export interface OrderedRecipe {
  recipe: Recipe;       // 菜谱详情数据
  orderedBy: string[];  // 点了这道菜的所有成员列表（如：["爸爸", "妈妈"]）
  count: number;        // 该菜品被点的总份数
}

/** Component Props 接口声明 */
interface Props {
  members: { id: string; name: string; avatar: string }[]; // 预设家庭成员列表
  currentMember: string;                                   // 当前选中的点菜人姓名
  customNameInput: string;                                 // 自定义昵称输入框内容
  showCustomName: boolean;                                 // 是否展开自定义昵称输入框
  recipes: Recipe[];                                       // 全部菜谱列表
  orderedRecipes: OrderedRecipe[];                         // 今日已点菜品列表（已合并统计）
  orderedByRecipe: Map<string, OrderedRecipe>;             // 菜品 ID 到已点数据的快速映射表
  categories: string[];                                    // 菜谱分类列表（如：热菜、凉菜、汤品）
  selectedCategory: string;                                // 当前选中的分类筛选
  searchQuery: string;                                     // 搜索框关键词
  isLoading: boolean;                                      // 菜谱数据加载状态
  onMemberChange: (name: string) => void;                  // 切换当前点菜人回调
  onCustomNameChange: (name: string) => void;              // 自定义昵称输入回调
  onShowCustomNameChange: (show: boolean) => void;         // 切换显示自定义昵称框回调
  onClearOrders: () => void;                               // 清空今日菜单回调
  onTabChange: () => void;                                 // 切换选项卡回调（跳转采购清单）
  onSearchChange: (v: string) => void;                     // 搜索关键词变更回调
  onCategoryChange: (v: string) => void;                   // 分类切换回调
  onViewRecipe: (r: Recipe) => void;                       // 查看菜谱详情回调
  onToggleRecipe: (r: Recipe) => void;                     // 选择/取消选择菜品回调
}

/**
 * 点菜视图面板组件
 * 包含：点菜人选择、今日已点菜单预览（支持任意人删除）、菜谱搜索过滤与卡片列表展示
 */
export function OrderPanel(p: Props) {
  // 根据分类筛选与搜索关键词，过滤出符合条件的菜谱列表
  const filtered = p.recipes.filter(
    (r) =>
      (p.selectedCategory === "全部" || r.category === p.selectedCategory) &&
      (!p.searchQuery.trim() ||
        r.name.toLowerCase().includes(p.searchQuery.toLowerCase()) ||
        !!r.description?.toLowerCase().includes(p.searchQuery.toLowerCase()) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(p.searchQuery.toLowerCase())))
  );

  return (
    <div id="section-order-view" className="space-y-6">
      {/* 1. 当前点菜人选择区域 */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">当前点菜人</span>
          </div>
          {/* 自定义昵称开关按钮 */}
          <button
            onClick={() => p.onShowCustomNameChange(!p.showCustomName)}
            className="text-xs text-orange-600 hover:underline flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>自定义昵称</span>
          </button>
        </div>

        {/* 自定义昵称输入面板 */}
        {p.showCustomName && (
          <div className="flex items-center gap-2 mb-3">
            <input
              value={p.customNameInput}
              onChange={(e) => p.onCustomNameChange(e.target.value)}
              placeholder="输入您的昵称，如：二宝、姑姑"
              className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() =>
                p.customNameInput.trim() &&
                (p.onMemberChange(p.customNameInput.trim()), p.onShowCustomNameChange(false))
              }
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
            >
              确定
            </button>
            <button onClick={() => p.onShowCustomNameChange(false)} className="px-2 py-2 text-stone-500 text-sm">
              取消
            </button>
          </div>
        )}

        {/* 预设成员快速选择按钮 */}
        <div className="flex items-center gap-2 flex-wrap">
          {p.members.map((m) => {
            const selected = p.currentMember === m.name;
            return (
              <button
                key={m.id}
                onClick={() => p.onMemberChange(m.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selected
                    ? "bg-orange-500 text-white shadow-xs scale-105"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                <span className="text-base">{m.avatar}</span>
                <span>{m.name}</span>
                {selected && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 今日菜单预览区域（支持实时汇总与全员退菜） */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 rounded-2xl border border-amber-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-bold text-stone-900">今日菜单 ({p.orderedRecipes.length} 道菜)</h2>
          </div>
          {/* 一键清空所有已点菜单 */}
          {p.orderedRecipes.length > 0 && (
            <button
              onClick={p.onClearOrders}
              className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空菜单</span>
            </button>
          )}
        </div>

        {/* 菜单为空时的占位提示 */}
        {p.orderedRecipes.length === 0 ? (
          <div className="py-6 text-center text-stone-500 text-sm">
            <p>今天还没有选菜哦！点击下方菜谱选择想吃的菜品 🍲</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* 已点菜品标签列表 */}
            <div className="flex flex-wrap gap-2">
              {p.orderedRecipes.map(({ recipe, orderedBy, count }) => (
                <div
                  key={recipe.id}
                  className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs text-sm"
                >
                  {/* 菜名及累计数量（多人点时显示 x2） */}
                  <span className="font-semibold text-stone-800">
                    {recipe.name} {count > 1 && <span className="text-orange-600 font-bold">x{count}</span>}
                  </span>

                  {/* 点菜人身份徽章列表 */}
                  <div className="flex items-center gap-1">
                    {orderedBy.map((u) => (
                      <span
                        key={u}
                        className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-medium"
                      >
                        {u}
                      </span>
                    ))}
                  </div>

                  {/* 任意成员均可点击退菜/清除此菜品的删除按钮 */}
                  <button
                    onClick={() => p.onToggleRecipe(recipe)}
                    title="移除这道菜"
                    className="text-stone-400 hover:text-white hover:bg-red-500 p-0.5 rounded-md transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 快速进入买菜清单栏 */}
            <div className="pt-3 mt-3 border-t border-amber-200/60 flex items-center justify-between">
              <p className="text-xs text-stone-600">点好菜了？系统将自动合并食材并生成采购清单！</p>
              <button
                id="btn-goto-shopping"
                onClick={p.onTabChange}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all hover:gap-2"
              >
                <span>去买菜清单</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. 搜索框与分类标签筛选 */}
      <div className="space-y-3">
        {/* 搜索输入框 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={p.searchQuery}
            onChange={(e) => p.onSearchChange(e.target.value)}
            placeholder="搜索菜名或食材，如：番茄、牛肉、茄子..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {p.searchQuery && (
            <button
              onClick={() => p.onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 分类切换按钮组 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {p.categories.map((c) => (
            <button
              key={c}
              onClick={() => p.onCategoryChange(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                p.selectedCategory === c
                  ? "bg-stone-900 text-white font-semibold"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 可选菜谱卡片网格区域 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-700">可选菜谱 ({filtered.length})</h3>
          <span className="text-xs text-stone-400">点击卡片查看做法详情</span>
        </div>

        {/* 异步加载状态控制 */}
        {p.isLoading ? (
          <div className="py-12 text-center text-stone-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
            <span>正在加载菜谱...</span>
          </div>
        ) : filtered.length === 0 ? (
          /* 无结果提示 */
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            <p>没有找到相关菜谱</p>
            <button
              onClick={() => {
                p.onSearchChange("");
                p.onCategoryChange("全部");
              }}
              className="mt-2 text-xs text-orange-600 hover:underline"
            >
              重置筛选条件
            </button>
          </div>
        ) : (
          /* 菜谱网格列表 */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                orderedBy={p.orderedByRecipe.get(r.id)?.orderedBy || []}
                currentMember={p.currentMember}
                onView={p.onViewRecipe}
                onToggle={p.onToggleRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}