import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'รหัสหมวดหมู่ไม่ถูกต้อง' },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        words: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { words: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'ไม่พบหมวดหมู่ที่ระบุ' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: category }, { status: 200 });
  } catch (error) {
    console.error('GET /api/categories/:id error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'รหัสหมวดหมู่ไม่ถูกต้อง' },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'รูปแบบ Request Body ไม่ถูกต้อง (Invalid JSON)' },
        { status: 400 },
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'ข้อมูล Request Body ต้องเป็น Object' },
        { status: 400 },
      );
    }

    const { name, description } = body as {
      name?: unknown;
      description?: unknown;
    };

    if (name === undefined && description === undefined) {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลที่ต้องการแก้ไข (name หรือ description)' },
        { status: 400 },
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'ไม่พบหมวดหมู่ที่ระบุ' },
        { status: 404 },
      );
    }

    const updateData: { name?: string; description?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'ชื่อหมวดหมู่ต้องเป็นข้อความและไม่เป็นค่าว่าง' },
          { status: 400 },
        );
      }
      const trimmedName = name.trim();
      if (trimmedName !== existingCategory.name) {
        const duplicateName = await prisma.category.findUnique({
          where: { name: trimmedName },
        });

        if (duplicateName) {
          return NextResponse.json(
            { error: 'ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว' },
            { status: 409 },
          );
        }
      }
      updateData.name = trimmedName;
    }

    if (description !== undefined) {
      if (description === null) {
        updateData.description = null;
      } else if (typeof description === 'string') {
        updateData.description = description.trim();
      } else {
        return NextResponse.json(
          {
            error:
              'คำอธิบายหมวดหมู่ (description) ต้องเป็นข้อความหรือ null เท่านั้น',
          },
          { status: 400 },
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updatedCategory }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/categories/:id error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลหมวดหมู่' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'รหัสหมวดหมู่ไม่ถูกต้อง' },
        { status: 400 },
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'ไม่พบหมวดหมู่ที่ระบุ' },
        { status: 404 },
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'ลบหมวดหมู่สำเร็จ', data: { id } },
      { status: 200 },
    );
  } catch (error) {
    console.error('DELETE /api/categories/:id error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบหมวดหมู่' },
      { status: 500 },
    );
  }
}
