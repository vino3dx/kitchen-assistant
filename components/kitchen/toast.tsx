"use client";

import { Sparkles } from "lucide-react";

/** 轻提示，仅展示由父组件传入的文案。 */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-fade-in"><Sparkles className="w-4 h-4 text-amber-400" /><span>{message}</span></div>;
}
