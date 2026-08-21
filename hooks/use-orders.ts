"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearOrders as clearOrdersApi,
  createOrder as createOrderApi,
  deleteOrder as deleteOrderApi,
  fetchOrders,
} from "@/lib/kitchen/orders";
import { supabaseClient } from "@/lib/supabase";
import type { Order, OrderInsert } from "@/lib/kitchen/types";

/**
 * 管理订单状态，并同步 orders 表的 Supabase Realtime 变更。
 *
 * INSERT、UPDATE、DELETE 事件统一重新读取列表，以确保排序和远端数据一致。
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  /** 从 API 刷新订单，组件已卸载时不再写入 React 状态。 */
  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextOrders = await fetchOrders();
      if (isMountedRef.current) setOrders(nextOrders);
    } catch (caughtError) {
      if (isMountedRef.current) {
        setError(caughtError instanceof Error ? caughtError : new Error("获取订单失败"));
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    // 推迟首屏请求，避免在 Effect 同步阶段触发状态更新。
    void Promise.resolve().then(refreshOrders);

    const channel = supabaseClient
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => void refreshOrders(),
      )
      .subscribe();

    return () => {
      isMountedRef.current = false;
      // 显式移除频道，防止路由切换或开发模式重复挂载后残留订阅。
      void supabaseClient.removeChannel(channel);
    };
  }, [refreshOrders]);

  /** 新增订单后返回数据库记录；Realtime 会负责刷新本地列表。 */
  const createOrder = useCallback(async (order: OrderInsert) => {
    setError(null);
    try {
      const createdOrder = await createOrderApi(order);
      await refreshOrders();
      return createdOrder;
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError : new Error("新增订单失败");
      setError(nextError);
      throw nextError;
    }
  }, [refreshOrders]);

  /** 删除指定订单。 */
  const removeOrder = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteOrderApi(id);
      await refreshOrders();
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError : new Error("删除订单失败");
      setError(nextError);
      throw nextError;
    }
  }, [refreshOrders]);

  /** 清空订单表。 */
  const clearOrders = useCallback(async () => {
    setError(null);
    try {
      await clearOrdersApi();
      await refreshOrders();
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError : new Error("清空订单失败");
      setError(nextError);
      throw nextError;
    }
  }, [refreshOrders]);

  return { orders, isLoading, error, refreshOrders, createOrder, removeOrder, clearOrders };
}
