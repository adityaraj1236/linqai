import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});

const SaveWorkflowSchema = z.object({
  name: z.string().min(1).max(100).default('Untitled Workflow'),
  description: z.string().max(500).optional(),
  nodes: z.array(NodeSchema).min(1),
  edges: z.array(EdgeSchema),
  thumbnail: z.string().optional(),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const workflows = await prisma.workflow.findMany({
      where: { userId },    
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { runs: true } },
      },
    });

    return NextResponse.json({ workflows });
  } catch (err) {
    console.error('[GET /api/workflows]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = SaveWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, description, nodes, edges, thumbnail } = parsed.data;

    const sanitizedNodes = nodes.map((node) => ({
      ...node,
      data: sanitizeNodeData(node.data),
    }));

    const workflow = await prisma.workflow.create({
      data: {
        userId,            
        name,
        description,
        nodes: sanitizedNodes,
        edges,
        thumbnail,
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/workflows]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function sanitizeNodeData(data: Record<string, unknown>): Record<string, unknown> {
  const d = { ...data };
  ['imageUrl', 'videoUrl', 'frameUrl'].forEach((k) => {
    if (typeof d[k] === 'string' && (d[k] as string).startsWith('data:')) d[k] = '[stripped]';
  });
  Object.keys(d).forEach((k) => { if (typeof d[k] === 'function') delete d[k]; });
  return d;
}