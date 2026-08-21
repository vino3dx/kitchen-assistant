"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchRecipes } from "@/lib/kitchen/recipes";
import type { Recipe } from "@/lib/kitchen/types";

/**
 * 管理菜谱数据及页面筛选条件。
 *
 * 菜谱数据仅通过 lib/kitchen/recipes 中的 API 函数读取，避免组件直接依赖
 * Supabase 客户端。
 */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  /** 重新获取菜谱；可在菜谱增删改成功后调用。 */
  const refreshRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setRecipes(await fetchRecipes());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error("获取菜谱失败"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 推迟到当前 Effect 提交完成后再发起请求，符合 React 19 的 Effect 调度约束。
    void Promise.resolve().then(refreshRecipes);
  }, [refreshRecipes]);

  /** 按分类及名称、描述关键字筛选，避免在渲染期间重复计算。 */
  const filteredRecipes = useMemo(() => {
    const keyword = searchQuery.trim().toLocaleLowerCase();

    return recipes.filter((recipe) => {
      const matchesCategory = selectedCategory === "全部" || recipe.category === selectedCategory;
      const searchableText = `${recipe.name} ${recipe.description ?? ""}`.toLocaleLowerCase();
      const matchesKeyword = !keyword || searchableText.includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [recipes, searchQuery, selectedCategory]);

  return {
    recipes,
    filteredRecipes,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    refreshRecipes,
  };
}
