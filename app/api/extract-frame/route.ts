
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const buffer = await req.arrayBuffer();
    const text = Buffer.from(buffer).toString('utf-8');

    let videoBase64: string | undefined;
    let timestamp: number = 50;

    try {
      const body = JSON.parse(text) as { videoBase64?: string; timestamp?: number };
      videoBase64 = body.videoBase64;
      timestamp = body.timestamp ?? 50;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body — video may be too large. Use a video under 7MB.' }, { status: 400 });
    }

    if (!videoBase64) {
      return NextResponse.json({ error: 'videoBase64 is required' }, { status: 400 });
    }

    const base64Data = videoBase64.includes(',') ? videoBase64.split(',')[1] : videoBase64;
    const mimeMatch = videoBase64.match(/data:([^;]+);base64/);
    const ext = mimeMatch?.[1]?.includes('webm') ? 'webm' : 'mp4';

    const id = randomBytes(8).toString('hex');
    const videoPath = join(tmpdir(), `video-${id}.${ext}`);
    const framePath = join(tmpdir(), `frame-${id}.jpg`);

    await writeFile(videoPath, Buffer.from(base64Data, 'base64'));

    try {
      const ffmpeg = require('fluent-ffmpeg');
      try {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        ffmpeg.setFfmpegPath(ffmpegPath);
      } catch { /* use system ffmpeg */ }

      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath).ffprobe((err: Error | null, meta: { format?: { duration?: number } }) => {
          const duration = !err && meta?.format?.duration ? meta.format.duration : 10;
          const seekTime = Math.max(0, (timestamp / 100) * duration - 0.1);

          ffmpeg(videoPath)
            .seekInput(seekTime)
            .frames(1)
            .outputOptions(['-vf', 'scale=1280:-1', '-q:v', '3'])
            .output(framePath)
            .on('end', resolve)
            .on('error', (e: Error) => reject(e))
            .run();
        });
      });

      const frameBuffer = await readFile(framePath);
      const frameBase64 = `data:image/jpeg;base64,${frameBuffer.toString('base64')}`;

      await Promise.all([unlink(videoPath).catch(() => {}), unlink(framePath).catch(() => {})]);
      return NextResponse.json({ frameBase64 });

    } catch (ffmpegErr) {
      await unlink(videoPath).catch(() => {});
      return NextResponse.json(
        { error: 'ffmpeg error: ' + (ffmpegErr instanceof Error ? ffmpegErr.message : 'unknown') },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Frame extraction failed' },
      { status: 500 }
    );
  }
}