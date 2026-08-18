import { store } from "@/lib/store";
import { NextResponse } from "next/server";

// 获取今日点菜菜单
export async function GET() {
  try {
    const orders = store.getMealOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取今日菜单失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 点菜（添加菜品到今日菜单）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipeId, userName, action } = body;

    if (action === "toggle") {
      // If toggling and already selected by this user or in general:
      const existingOrders = store.getMealOrders();
      const match = existingOrders.find(
        (o) => o.recipe_id === recipeId && (!userName || o.user_name === userName)
      );

      if (match) {
        store.removeMealOrder(match.id);
        return NextResponse.json({
          success: true,
          action: "removed",
          data: store.getMealOrders(),
        });
      } else {
        const order = store.addMealOrder(recipeId, userName || "家庭成员");
        return NextResponse.json({
          success: true,
          action: "added",
          order,
          data: store.getMealOrders(),
        });
      }
    }

    if (!recipeId) {
      return NextResponse.json({ success: false, error: "缺少 recipeId" }, { status: 400 });
    }

    const order = store.addMealOrder(recipeId, userName || "家庭成员");
    return NextResponse.json({ success: true, data: order, orders: store.getMealOrders() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "点菜失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 取消点菜 / 清空菜单
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    const recipeId = searchParams.get("recipeId");
    const userName = searchParams.get("userName") || undefined;
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      store.clearMealOrders();
      return NextResponse.json({ success: true, message: "今日菜单已清空" });
    }

    if (orderId) {
      store.removeMealOrder(orderId);
      return NextResponse.json({ success: true, data: store.getMealOrders() });
    }

    if (recipeId) {
      store.removeMealOrderByRecipeId(recipeId, userName);
      return NextResponse.json({ success: true, data: store.getMealOrders() });
    }

    return NextResponse.json({ success: false, error: "缺少删除参数" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "取消点菜失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
