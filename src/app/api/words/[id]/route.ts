import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WordStatus } from '@prisma/client';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'รหัสคำศัพท์ไม่ถูกต้อง' },
        { status: 400 },
      );
    }

    const word = await prisma.word.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: 'ไม่พบคำศัพท์ที่ระบุ' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: word }, { status: 200 });
  } catch (error) {
    console.error('GET /api/words/:id error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำศัพท์' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'รหัสคำศัพท์ไม่ถูกต้อง' },
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

    const { categoryId, term, meaning, partOfSpeech, exampleSentence, status } =
      body as {
        categoryId?: unknown;
        term?: unknown;
        meaning?: unknown;
        partOfSpeech?: unknown;
        exampleSentence?: unknown;
        status?: unknown;
      };

    if (
      categoryId === undefined &&
      term === undefined &&
      meaning === undefined &&
      partOfSpeech === undefined &&
      exampleSentence === undefined &&
      status === undefined
    ) {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลที่ต้องการแก้ไข' },
        { status: 400 },
      );
    }

    const existingWord = await prisma.word.findUnique({
      where: { id },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: 'ไม่พบคำศัพท์ที่ระบุ' },
        { status: 404 },
      );
    }

    const updateData: {
      categoryId?: string;
      term?: string;
      meaning?: string;
      partOfSpeech?: string | null;
      exampleSentence?: string | null;
      status?: WordStatus;
    } = {};

    if (categoryId !== undefined) {
      if (typeof categoryId !== 'string' || categoryId.trim() === '') {
        return NextResponse.json(
          { error: 'รหัสหมวดหมู่ (categoryId) ต้องเป็นข้อความและไม่เป็นค่าว่าง' },
          { status: 400 },
        );
      }
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId.trim() },
      });
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'ไม่พบหมวดหมู่ที่ระบุ' },
          { status: 404 },
        );
      }
      updateData.categoryId = categoryId.trim();
    }

    if (term !== undefined) {
      if (typeof term !== 'string' || term.trim() === '') {
        return NextResponse.json(
          { error: 'คำศัพท์ (term) ต้องเป็นข้อความและไม่เป็นค่าว่าง' },
          { status: 400 },
        );
      }
      updateData.term = term.trim();
    }

    if (meaning !== undefined) {
      if (typeof meaning !== 'string' || meaning.trim() === '') {
        return NextResponse.json(
          { error: 'ความหมาย (meaning) ต้องเป็นข้อความและไม่เป็นค่าว่าง' },
          { status: 400 },
        );
      }
      updateData.meaning = meaning.trim();
    }

    if (partOfSpeech !== undefined) {
      if (partOfSpeech === null) {
        updateData.partOfSpeech = null;
      } else if (typeof partOfSpeech === 'string') {
        updateData.partOfSpeech = partOfSpeech.trim();
      } else {
        return NextResponse.json(
          { error: 'ชนิดของคำ (partOfSpeech) ต้องเป็นข้อความหรือ null เท่านั้น' },
          { status: 400 },
        );
      }
    }

    if (exampleSentence !== undefined) {
      if (exampleSentence === null) {
        updateData.exampleSentence = null;
      } else if (typeof exampleSentence === 'string') {
        updateData.exampleSentence = exampleSentence.trim();
      } else {
        return NextResponse.json(
          {
            error:
              'ประโยคตัวอย่าง (exampleSentence) ต้องเป็นข้อความหรือ null เท่านั้น',
          },
          { status: 400 },
        );
      }
    }

    if (status !== undefined) {
      if (
        typeof status !== 'string' ||
        !Object.values(WordStatus).includes(status as WordStatus)
      ) {
        return NextResponse.json(
          { error: 'สถานะ (status) ไม่ถูกต้อง (UNLEARNED, LEARNING, MASTERED)' },
          { status: 400 },
        );
      }
      updateData.status = status as WordStatus;
    }

    const updatedWord = await prisma.word.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json({ data: updatedWord }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/words/:id error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลคำศัพท์' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'รหัสคำศัพท์ไม่ถูกต้อง' },
        { status: 400 },
      );
    }

    const existingWord = await prisma.word.findUnique({
      where: { id },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: 'ไม่พบคำศัพท์ที่ระบุ' },
        { status: 404 },
      );
    }

    await prisma.word.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'ลบคำศัพท์สำเร็จ', data: { id } },
      { status: 200 },
    );
  } catch (error) {
    console.error('DELETE /api/words/:id error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบคำศัพท์' },
      { status: 500 },
    );
  }
}
