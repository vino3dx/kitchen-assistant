"use client";

import Link from "next/link";
import { BookOpen, ChefHat, Copy, RotateCcw, ShoppingCart, UtensilsCrossed } from "lucide-react";

export type KitchenTab = "order" | "shopping" | "cook";

interface KitchenHeaderProps {
  activeTab: KitchenTab; onTabChange: (tab: KitchenTab) => void; orderCount: number;
  shopping: { completed: number; total: number; percent: number };
  cooking: { completed: number; total: number; percent: number };
  familyCode: string | null;
  onCopyFamilyCode: () => void;
  onSwitchFamily: () => void;
}

/** 厨房应用页头及三阶段导航。 */
export function KitchenHeader({ activeTab, onTabChange, orderCount, shopping, cooking, familyCode, onCopyFamilyCode, onSwitchFamily }: KitchenHeaderProps) {
  const tabClass = (tab: KitchenTab, active: string) => `flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? active : "text-stone-600 hover:text-stone-900"}`;
  return <header id="kitchen-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs"><ChefHat className="w-6 h-6" /></div><div><div className="flex items-center gap-2"><h1 className="text-lg font-bold tracking-tight text-stone-900" style={{ width: "73.9375px" }}>厨房助手</h1><span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium border border-amber-200" style={{ width: "61px" }}>Kitchen Assistant</span></div><p className="text-xs text-stone-500">点菜 → 智能买菜清单 → 烹饪指南</p><div className="mt-2 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700"><span className="font-semibold text-stone-900">{familyCode ? `家庭码: ${familyCode}` : "未加入家庭"}</span></div></div></div><div className="flex items-center gap-2"><button type="button" onClick={onCopyFamilyCode} disabled={!familyCode} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Copy className="w-3.5 h-3.5" /><span>复制家庭码</span></button><button type="button" onClick={onSwitchFamily} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-stone-900 hover:bg-black transition-colors"><RotateCcw className="w-3.5 h-3.5" /><span>切换家庭</span></button><Link id="btn-nav-admin" href="/admin" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"><BookOpen className="w-3.5 h-3.5" /><span>菜谱库管理</span></Link></div></div>
    <div className="max-w-4xl mx-auto px-4 pt-1 pb-2"><nav className="grid grid-cols-3 p-1 bg-stone-100/90 rounded-xl border border-stone-200 gap-1"><button id="tab-btn-order" onClick={() => onTabChange("order")} className={tabClass("order", "bg-white text-orange-600 shadow-xs border border-stone-200/70")}><UtensilsCrossed className="w-4 h-4" /><span>1. 点菜</span>{orderCount > 0 && <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">{orderCount}</span>}</button><button id="tab-btn-shopping" onClick={() => onTabChange("shopping")} className={tabClass("shopping", "bg-white text-emerald-700 shadow-xs border border-stone-200/70")}><ShoppingCart className="w-4 h-4" /><span>2. 买菜</span>{shopping.total > 0 && <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${shopping.percent === 100 ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{shopping.completed}/{shopping.total}</span>}</button><button id="tab-btn-cook" onClick={() => onTabChange("cook")} className={tabClass("cook", "bg-white text-amber-700 shadow-xs border border-stone-200/70")}><ChefHat className="w-4 h-4" /><span>3. 做菜</span>{cooking.total > 0 && <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${cooking.percent === 100 ? "bg-amber-100 text-amber-800" : "bg-stone-200 text-stone-700"}`}>{cooking.completed}/{cooking.total}</span>}</button></nav></div>
  </header>;
}
