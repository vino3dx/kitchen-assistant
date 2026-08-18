import { store } from "@/lib/store";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 获取单个菜谱详情
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const recipe = store.getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ success: false, error: "未找到该菜谱" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: recipe });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取菜谱详情失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 更新菜谱
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = store.updateRecipe(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "未找到该菜谱" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "更新菜谱失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 删除菜谱
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const success = store.deleteRecipe(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "删除失败，菜谱不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "删除菜谱失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
