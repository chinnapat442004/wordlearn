import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { words: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "รูปแบบ Request Body ไม่ถูกต้อง (Invalid JSON)" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "ข้อมูล Request Body ต้องเป็น Object" },
        { status: 400 }
      );
    }

    const { name, description } = body as {
      name?: unknown;
      description?: unknown;
    };

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "ชื่อหมวดหมู่จำเป็นต้องระบุ และต้องไม่เป็นค่าว่าง" },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
      return NextResponse.json(
        { error: "คำอธิบายหมวดหมู่ (description) ต้องเป็นข้อความเท่านั้น" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedDescription =
      typeof description === "string" ? description.trim() : null;

    const existingCategory = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        description: trimmedDescription,
      },
    });

    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่" },
      { status: 500 }
    );
  }
}