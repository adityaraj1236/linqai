import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = "nodejs"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: "v1beta" }
    );

    const result = await model.generateContent([
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "image/png",
        },
      },
      "Identify the main product in this image. Return JSON with x,y,width,height bounding box."
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

    const box = JSON.parse(jsonMatch[0]);
    const { x, y, width, height } = box;

    const cropped = await sharp(buffer)
      .extract({
        left: Math.max(0, x),
        top: Math.max(0, y),
        width: Math.max(1, width),
        height: Math.max(1, height),
      })
      .toBuffer();

    return new Response(cropped, {
      headers: { "Content-Type": "image/png" },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
