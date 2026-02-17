import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model } = await request.json();

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating with model:', model);
    console.log('Original prompt:', prompt);

    let finalPrompt = prompt;
    let enhancedByGemini = false;
    if (process.env.GOOGLE_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const geminiModel = genAI.getGenerativeModel({ 
          model: 'gemini-pro'
        });

        const enhancementPrompt = `Enhance this image generation prompt to be more detailed and artistic. Keep it under 100 words. Return ONLY the enhanced prompt without any explanation or quotes:

${prompt}`;

        const result = await geminiModel.generateContent(enhancementPrompt);
        const response = await result.response;
        const enhanced = response.text()?.trim();
        
        if (enhanced) {
          finalPrompt = enhanced;
          enhancedByGemini = true;
          console.log('✅ Gemini enhanced prompt:', finalPrompt);
        }
      } catch (geminiErr: unknown) {
        console.warn('⚠️ Gemini enhancement failed, using original prompt:', geminiErr);
      }
    } else {
      console.log('ℹ️ No Gemini API key found, using original prompt');
    }
    const imageUrl = generateWithPollinations(finalPrompt, model);

    return NextResponse.json({ 
      imageUrl, 
      success: true,
      model: model || 'Pollinations AI',
      enhancedByGemini,
      originalPrompt: prompt,
      enhancedPrompt: enhancedByGemini ? finalPrompt : undefined
    });
  } catch (error: unknown) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}

function generateWithPollinations(prompt: string, model?: string) {
  const encodedPrompt = encodeURIComponent(prompt);
  const timestamp = Date.now();

  let modelParam = 'flux';
  let enhanceParam = '';

  if (model === 'Stable Diffusion XL') {
    modelParam = 'flux';
  } else if (model === 'DALL-E 3') {
    modelParam = 'flux';
    enhanceParam = '&enhance=true';
  } else if (model === 'Midjourney Style') {
    modelParam = 'flux';
    enhanceParam = '&enhance=true';
  } else if (model === 'Flux Pro') {
    modelParam = 'flux-pro';
  }
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true&model=${modelParam}${enhanceParam}`;
}