// app/api/workflows/[id]/route.ts
// Ownership check — user sirf apna workflow access kar sakta hai

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  nodes: z.array(z.record(z.unknown())).optional(),
  edges: z.array(z.record(z.unknown())).optional(),
  thumbnail: z.string().optional(),
});

// GET — load ek workflow (sirf owner kar sakta hai)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },     // ← userId se ownership verify
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          include: { nodeRuns: { orderBy: { startedAt: 'asc' } } },
        },
      },
    });

    if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ workflow });
  } catch (err) {
    console.error('[GET /api/workflows/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH — update (sirf owner kar sakta hai)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    // Ownership check
    const existing = await prisma.workflow.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const workflow = await prisma.workflow.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ workflow });
  } catch (err) {
    console.error('[PATCH /api/workflows/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE — sirf owner delete kar sakta hai
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.workflow.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.workflow.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/workflows/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}