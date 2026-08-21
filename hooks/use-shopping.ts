"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createExtraShoppingItem,
  deleteShoppingItem,
  fetchShoppingItems,
  updateShoppingChecked,
} from "@/lib/kitchen/shopping";
import type { ExtraShoppingItem, ShoppingItem } from "@/lib/kitchen/types";

/** 管理采购清单读取、勾选、补录和删除操作。 */
export function useShopping() {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /** 重新读取采购清单。 */
  const refreshShoppingItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setShoppingItems(await fetchShoppingItems());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error("获取采购清单失败"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 推迟到当前 Effect 提交完成后再发起请求，符合 React 19 的 Effect 调度约束。
    void Promise.resolve().then(refreshShoppingItems);
  }, [refreshShoppingItems]);

  /**
   * 乐观更新勾选状态；接口失败时回滚为服务端更新前的本地列表。
   */
  const setItemChecked = useCallback(async (id: string, checked: boolean) => {
    const previousItems = shoppingItems;
    setError(null);
    setShoppingItems((items) => items.map((item) => (item.id === id ? { ...item, checked } : item)));

    try {
      const updatedItem = await updateShoppingChecked(id, checked);
      setShoppingItems((items) => items.map((item) => (item.id === id ? updatedItem : item)));
      return updatedItem;
    } catch (caughtError) {
      setShoppingItems(previousItems);
      const nextError = caughtError instanceof Error ? caughtError : new Error("更新采购项失败");
      setError(nextError);
      throw nextError;
    }
  }, [shoppingItems]);

  /** 按当前状态切换采购项勾选状态。 */
  const toggleItemChecked = useCallback(async (id: string) => {
    const item = shoppingItems.find((shoppingItem) => shoppingItem.id === id);
    if (!item) throw new Error("未找到采购项");

    return setItemChecked(id, !item.checked);
  }, [setItemChecked, shoppingItems]);

  /** 添加一条补录采购项。 */
  const addExtraItem = useCallback(async (name: string, quantityStr?: string): Promise<ExtraShoppingItem> => {
    setError(null);
    try {
      const item = await createExtraShoppingItem(name, quantityStr);
      setShoppingItems((items) => [...items, item]);
      return item;
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError : new Error("添加采购项失败");
      setError(nextError);
      throw nextError;
    }
  }, []);

  /** 删除一条采购项。 */
  const removeShoppingItem = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteShoppingItem(id);
      setShoppingItems((items) => items.filter((item) => item.id !== id));
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError : new Error("删除采购项失败");
      setError(nextError);
      throw nextError;
    }
  }, []);

  return {
    shoppingItems,
    isLoading,
    error,
    refreshShoppingItems,
    setItemChecked,
    toggleItemChecked,
    addExtraItem,
    removeShoppingItem,
  };
}
