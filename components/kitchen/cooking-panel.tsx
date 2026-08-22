"use client";

import { Check, CheckCircle2, ChefHat, Info, ListOrdered, ShoppingBag, Soup, UtensilsCrossed } from "lucide-react";
import type { Recipe } from "@/lib/kitchen/types";
import type { OrderedRecipe } from "./order-panel";

/** 烹饪工作台组件 Props 接口 */
interface CookingPanelProps {
  /** 今日已点的菜品列表 */
  orderedRecipes: OrderedRecipe[];
  /** 当前选中的菜品（可为 null） */
  activeRecipe: Recipe | null;
  /** 当前选中的菜品 ID */
  selectedId: string | null;
  /** 菜品做完状态映射表 { [dishId]: boolean } */
  completedDishes: Record<string, boolean>;
  /** 步骤完成状态映射表 { [dishId]: stepNumber[] } */
  completedSteps: Record<string, number[]>;
  /** 做菜进度统计（已完成数、总数、百分比） */
  stats: { completed: number; total: number; percent: number };
  /** 选择/切换当前展示菜品的回调 */
  onSelect: (id: string) => void;
  /** 标记/取消单个步骤完成状态的回调 */
  onToggleStep: (id: string, step: number) => void;
  /** 标记/取消整个菜品完成状态的回调 */
  onToggleDish: (id: string) => void;
  /** 跳转至点菜页面的回调 */
  onGoOrder: () => void;
}

/**
 * 烹饪工作台组件
 * 提供菜品步骤拆解、食材用量查看及做菜进度交互
 */
export function CookingPanel({
  orderedRecipes,
  activeRecipe,
  selectedId,
  completedDishes,
  completedSteps,
  stats,
  onSelect,
  onToggleStep,
  onToggleDish,
  onGoOrder,
}: CookingPanelProps) {
  return (
    <div id="section-cook-view" className="space-y-6">
      {/* 1. 顶部做菜进度概览面板 */}
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
          <div className="text-right">
            <div className="text-xs text-stone-400">已做完</div>
            <div className="text-lg font-black text-amber-600">
              {stats.completed} / {stats.total} 道
            </div>
          </div>
        </div>
        {/* 总体进度条 */}
        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* 2. 主体区：未选菜提示或菜品步骤展示 */}
      {orderedRecipes.length === 0 ? (
        /* 未选菜品时的空状态卡片 */
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <Soup className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">还没有选择要做的菜品</h3>
          <p className="text-xs text-stone-500">
            先在「点菜」页面选好今天吃什么，这里就会显示每道菜的详细做法和制作步骤。
          </p>
          <button
            onClick={onGoOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            去点菜
          </button>
        </div>
      ) : (
        <>
          {/* 已点菜品 Tab 标签切换栏 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {orderedRecipes.map(({ recipe }) => {
              const cooked = completedDishes[recipe.id];
              return (
                <button
                  key={recipe.id}
                  onClick={() => onSelect(recipe.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap border ${
                    selectedId === recipe.id
                      ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                      : cooked
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white text-stone-700 hover:bg-stone-100 border-stone-200"
                  }`}
                >
                  {cooked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <UtensilsCrossed className="w-4 h-4" />
                  )}
                  {recipe.name}
                  {cooked && <span className="text-xs opacity-80">(已完成)</span>}
                </button>
              );
            })}
          </div>

          {/* 当前选中菜品的详细做法面板 */}
          {activeRecipe && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-6">
              {/* 菜品标题与完成按钮 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-stone-900">{activeRecipe.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                      {activeRecipe.category}
                    </span>
                  </div>
                  {activeRecipe.description && (
                    <p className="text-xs text-stone-500 mt-1">{activeRecipe.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onToggleDish(activeRecipe.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    completedDishes[activeRecipe.id]
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-stone-900 text-white hover:bg-black"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedDishes[activeRecipe.id]
                    ? "已做好 (点击取消)"
                    : "这道菜做好了！"}
                </button>
              </div>

              {/* 食材用量清单网格 */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                  本道菜食材用量清单
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {activeRecipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between font-semibold text-stone-800">
                        <span>{ing.name}</span>
                        <span className="text-orange-600">
                          {ing.quantity ? `${ing.quantity} ${ing.unit}` : ing.unit}
                        </span>
                      </div>
                      {ing.note && (
                        <span className="text-[10px] text-stone-400 mt-0.5">
                          {ing.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 制作步骤列表 */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-stone-500" />
                  制作步骤 ({activeRecipe.steps.length} 步)
                </h4>
                {activeRecipe.steps.map((step, index) => {
                  // 修复点：显式为 step.step 赋予默认数字 (step.step ?? index + 1)，确保其类型绝对为 number，彻底解决 TS 类型检查报错
                  const stepNumber = step.step ?? index + 1;
                  const done = (completedSteps[activeRecipe.id] || []).includes(stepNumber);

                  return (
                    <div
                      key={stepNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        done
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-stone-200 hover:border-amber-300 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* 步骤序号圈号/勾选图标 */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              done ? "bg-emerald-600 text-white" : "bg-stone-900 text-white"
                            }`}
                          >
                            {done ? <Check className="w-4 h-4" /> : stepNumber}
                          </div>
                          <div>
                            <h5
                              className={`text-sm font-bold ${
                                done ? "line-through text-stone-400" : "text-stone-900"
                              }`}
                            >
                              {step.title}
                            </h5>
                            <p
                              className={`text-xs mt-1 leading-relaxed ${
                                done ? "text-stone-400" : "text-stone-700"
                              }`}
                            >
                              {step.content}
                            </p>
                            {step.tip && (
                              <div className="mt-2 text-[11px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70 inline-flex items-center gap-1">
                                <Info className="w-3 h-3 text-amber-600 shrink-0" />
                                小贴士: {step.tip}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* 标记单个步骤完成状态 */}
                        <button
                          onClick={() => onToggleStep(activeRecipe.id, stepNumber)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                            done
                              ? "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                          }`}
                        >
                          {done ? "已完成" : "完成此步"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}