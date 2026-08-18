import { store } from "@/lib/store";
import { NextResponse } from "next/server";

// 获取今日智能合并后的采购清单
export async function GET() {
  try {
    const shoppingList = store.getMergedShoppingList();
    const extraItems = store.getExtraShoppingItems();
    return NextResponse.json({
      success: true,
      data: {
        mergedItems: shoppingList,
        extraItems,
        totalItemsCount: shoppingList.length + extraItems.length,
        checkedCount:
          shoppingList.filter((i) => i.checked).length +
          extraItems.filter((i) => i.checked).length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取采购清单失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 切换勾选状态 / 添加额外采购项
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, unit, checked, quantityStr } = body;

    if (action === "toggle") {
      if (!name) {
        return NextResponse.json({ success: false, error: "缺少食材名称" }, { status: 400 });
      }
      const newChecked = store.toggleShoppingItemCheck(name, unit || "适量", checked);
      return NextResponse.json({
        success: true,
        checked: newChecked,
        data: store.getMergedShoppingList(),
      });
    }

    if (action === "add_extra") {
      if (!name || !name.trim()) {
        return NextResponse.json({ success: false, error: "请输入补录品名" }, { status: 400 });
      }
      const item = store.addExtraShoppingItem(name, quantityStr || "1份");
      return NextResponse.json({
        success: true,
        item,
        extraItems: store.getExtraShoppingItems(),
      });
    }

    if (action === "toggle_extra") {
      const { id } = body;
      store.toggleExtraItem(id);
      return NextResponse.json({
        success: true,
        extraItems: store.getExtraShoppingItems(),
      });
    }

    return NextResponse.json({ success: false, error: "未知操作类型" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "更新采购状态失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 删除额外采购品
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      store.deleteExtraItem(id);
      return NextResponse.json({
        success: true,
        extraItems: store.getExtraShoppingItems(),
      });
    }
    return NextResponse.json({ success: false, error: "缺少 ID" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "删除失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
