"use client";

import React from "react";
import { ArrowRight, Check, Layers, PlusCircle, ShoppingBag, Soup, Trash2, UtensilsCrossed } from "lucide-react";
import type { ExtraShoppingItem, MergedShoppingItem } from "@/lib/kitchen/types";
import { formatSmartQuantity, formatShoppingQuantity } from "@/lib/kitchen/ingredient-units";

// 向后兼容：调用新的换算表函数。保留此函数是为了避免未来其他引用处改坏。
// 注意：购物清单这里**不传入 sources 的做法备注（切碎 / 去籽切丝 …）**，避免括号被做菜提示占满；
// 括号里只保留通俗买菜叫法（约X个 / 约X块 / 约X根 / 1斤）。
function formatSmartQuantityLegacy(item: MergedShoppingItem): string {
  return formatSmartQuantity({
    name: item.name,
    totalQuantity: item.totalQuantity,
    unit: item.unit,
    sources: undefined,
  });
}
// 保持导出（未使用）避免潜在 lint 警告：当前 ShoppingPanel 用的是下方的 formatSmartQuantityLegacy。
void formatShoppingQuantity;

/** 采购清单面板，数据逻辑与 UI 完整对齐 */
export function ShoppingPanel({
  dishCount,
  stats,
  items,
  extras,
  extraName,
  extraQuantity,
  onExtraNameChange,
  onExtraQuantityChange,
  onAddExtra,
  onToggleItem,
  onToggleExtra,
  onDeleteExtra,
  onGoCook,
  onGoOrder,
}: {
  dishCount: number;
  stats: { completed: number; total: number; percent: number };
  items: MergedShoppingItem[];
  extras: ExtraShoppingItem[];
  extraName: string;
  extraQuantity: string;
  onExtraNameChange: (v: string) => void;
  onExtraQuantityChange: (v: string) => void;
  onAddExtra: (e: React.FormEvent) => void;
  onToggleItem: (item: MergedShoppingItem) => void;
  onToggleExtra: (id: string) => void;
  onDeleteExtra: (id: string) => void;
  onGoCook: () => void;
  onGoOrder: () => void;
}) {
  return (
    <div id="section-shopping-view" className="space-y-6">
      {/* 头部统计与去做菜按钮 */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900">今日采购清单</h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              系统根据今日 {dishCount} 道菜自动合并计算食材，去菜市场/超市直接照着买！
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-stone-400">采购进度</div>
              <div className="text-lg font-black text-emerald-600">
                {stats.completed} / {stats.total}
              </div>
            </div>
            <button
              id="btn-goto-cook"
              onClick={onGoCook}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              买齐了，去掌勺做菜
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* 今日未点菜状态 */}
      {dishCount === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <Soup className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">今日菜单还是空的</h3>
          <p className="text-xs text-stone-500">
            先去「点菜」选择想吃的菜品，系统将自动汇总需要买的所有食材。
          </p>
          <button
            onClick={onGoOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            现在去点菜
          </button>
        </div>
      )}

      {/* 食材列表展示 */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              智能合并食材清单 ({items.length} 样)
            </h3>
            <span className="text-xs text-stone-400">点击项目勾选完成</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {items.map((item) => {
              const checked = item.checked;
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleItem(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                    checked
                      ? "bg-emerald-50/50 border-emerald-200 text-stone-400"
                      : "bg-white border-stone-200 hover:border-emerald-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {/* 食材名称 */}
                        <span
                          className={`text-sm font-bold ${
                            checked ? "line-through text-stone-400" : "text-stone-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        {/* 克数 + 生活习惯叫法（如：500克 （1斤）） */}
                        <span
                          className={`text-sm font-semibold ${
                            checked ? "text-emerald-700/60" : "text-emerald-700"
                          }`}
                        >
                          {formatSmartQuantityLegacy(item)}
                        </span>
                      </div>

                      {/* 来源菜谱标签 */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.sources.map((s, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-1.5 py-0.2 rounded border ${
                              checked
                                ? "bg-stone-100 text-stone-400 border-stone-200"
                                : "bg-stone-50 text-stone-600 border-stone-200/80"
                            }`}
                          >
                            {s.dishName}
                            {s.quantity ? ` (${s.quantity}${s.unit})` : ""}
                          </span>
                        ))}
                        {item.sources.length > 1 && (
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

      {/* 临时补录采购项 */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-orange-500" />
          临时补录其他采购项（调料/饮品/日用品）
        </h3>
        <form onSubmit={onAddExtra} className="flex items-center gap-2">
          <input
            value={extraName}
            onChange={(e) => onExtraNameChange(e.target.value)}
            placeholder="品名，如：特级生抽、冰镇可乐、纸巾"
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            value={extraQuantity}
            onChange={(e) => onExtraQuantityChange(e.target.value)}
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

        {extras.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            {extras.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  item.checked
                    ? "bg-emerald-50/40 border-emerald-200 text-stone-400"
                    : "bg-stone-50 border-stone-200"
                }`}
              >
                <div
                  onClick={() => onToggleExtra(item.id)}
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
                  {item.quantityStr && (
                    <span className="text-xs text-stone-500">({item.quantityStr})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteExtra(item.id)}
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
  );
}