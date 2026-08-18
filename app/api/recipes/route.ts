import { store } from "@/lib/store";
import { NextResponse } from "next/server";

// 获取所有菜谱
export async function GET() {
  try {
    const recipes = store.getRecipes();
    return NextResponse.json({ success: true, data: recipes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取菜谱失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 新增菜谱
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "菜谱名称不能为空" }, { status: 400 });
    }

    const created = store.addRecipe({
      name: body.name.trim(),
      category: body.category || "热菜",
      description: body.description || "",
      prep_time: body.prep_time || "15分钟",
      difficulty: body.difficulty || "简单",
      ingredients: body.ingredients || [],
      steps: body.steps || [],
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "创建菜谱失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
