import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (
      !body ||
      !body.status ||
      !['RUNNING', 'SUCCESS', 'FAILED'].includes(body.status) ||
      !Array.isArray(body.nodeRuns)
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { workflowId, status, totalMs, nodeRuns } = body;

    if (workflowId) {
      const wf = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
      });

      if (!wf) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
    }

    const run = await prisma.workflowRun.create({
      data: {
        userId,
        workflowId: workflowId ?? null,
        status,
        completedAt: status !== 'RUNNING' ? new Date() : null,
        totalMs,
        nodeRuns: {
          create: nodeRuns.map((nr: any) => ({
            nodeId: nr.nodeId,
            nodeLabel: nr.nodeLabel,
            nodeType: nr.nodeType,
            status: nr.status,
            inputs: nr.inputs ?? {},
            output: nr.output ? String(nr.output).slice(0, 2000) : null,
            errorMsg: nr.errorMsg ?? null,
            durationMs: nr.durationMs,
            completedAt:
              nr.status !== 'RUNNING' ? new Date() : null,
          })),
        },
      },
      include: { nodeRuns: true },
    });

    return NextResponse.json({ run }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/runs]', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('workflowId');
    const limit = Math.min(
      Number(searchParams.get('limit') ?? '20'),
      50
    );

    const runs = await prisma.workflowRun.findMany({
      where: {
        userId,
        ...(workflowId ? { workflowId } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        nodeRuns: { orderBy: { startedAt: 'asc' } },
      },
    });

    return NextResponse.json({ runs });
  } catch (err) {
    console.error('[GET /api/runs]', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
