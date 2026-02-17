import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, type = 'product_details' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    const validTypes = ['system_prompt', 'product_details'];
    const textType = validTypes.includes(type) ? type : 'product_details';

    return NextResponse.json({
      text: trimmed,
      characterCount: trimmed.length,
      type: textType,
      success: true,
    });
  } catch (err: unknown) {
    console.error('Text processing error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to process text' },
      { status: 500 }
    );
  }
}
