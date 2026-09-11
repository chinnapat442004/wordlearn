import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WordStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const where: { categoryId?: string; status?: WordStatus } = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (
      status &&
      Object.values(WordStatus).includes(status as WordStatus)
    ) {
      where.status = status as WordStatus;
    }

    const words = await prisma.word.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: words }, { status: 200 });
  } catch (error) {
    console.error('GET /api/words error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำศัพท์' },
      { status: 500 },
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

    if (typeof categoryId !== 'string' || categoryId.trim() === '') {
      return NextResponse.json(
        { error: 'รหัสหมวดหมู่ (categoryId) จำเป็นต้องระบุ และต้องไม่เป็นค่าว่าง' },
        { status: 400 },
      );
    }

    if (typeof term !== 'string' || term.trim() === '') {
      return NextResponse.json(
        { error: 'คำศัพท์ (term) จำเป็นต้องระบุ และต้องไม่เป็นค่าว่าง' },
        { status: 400 },
      );
    }

    if (typeof meaning !== 'string' || meaning.trim() === '') {
      return NextResponse.json(
        { error: 'ความหมาย (meaning) จำเป็นต้องระบุ และต้องไม่เป็นค่าว่าง' },
        { status: 400 },
      );
    }

    if (
      partOfSpeech !== undefined &&
      partOfSpeech !== null &&
      typeof partOfSpeech !== 'string'
    ) {
      return NextResponse.json(
        { error: 'ชนิดของคำ (partOfSpeech) ต้องเป็นข้อความเท่านั้น' },
        { status: 400 },
      );
    }

    if (
      exampleSentence !== undefined &&
      exampleSentence !== null &&
      typeof exampleSentence !== 'string'
    ) {
      return NextResponse.json(
        { error: 'ประโยคตัวอย่าง (exampleSentence) ต้องเป็นข้อความเท่านั้น' },
        { status: 400 },
      );
    }

    if (
      status !== undefined &&
      (typeof status !== 'string' ||
        !Object.values(WordStatus).includes(status as WordStatus))
    ) {
      return NextResponse.json(
        { error: 'สถานะ (status) ไม่ถูกต้อง (UNLEARNED, LEARNING, MASTERED)' },
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

    const newWord = await prisma.word.create({
      data: {
        categoryId: categoryId.trim(),
        term: term.trim(),
        meaning: meaning.trim(),
        partOfSpeech:
          typeof partOfSpeech === 'string' ? partOfSpeech.trim() : null,
        exampleSentence:
          typeof exampleSentence === 'string' ? exampleSentence.trim() : null,
        status: (status as WordStatus) || WordStatus.UNLEARNED,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ data: newWord }, { status: 201 });
  } catch (error) {
    console.error('POST /api/words error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างคำศัพท์' },
      { status: 500 },
    );
  }
}
