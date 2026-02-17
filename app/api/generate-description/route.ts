import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { system_prompt, user_message, imageUrl, imageBase64 } = await request.json();

    if (!system_prompt || !user_message) {
      return NextResponse.json(
        { error: 'System prompt and user message required' },
        { status: 400 }
      );
    }

    let imagePart = null;
    if (imageBase64) {
      const base64Data = imageBase64.includes('base64,') 
        ? imageBase64.split('base64,')[1] 
        : imageBase64;
      
      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };
    } else if (imageUrl && imageUrl.startsWith('http')) {
      const imgResponse = await fetch(imageUrl);
      const buffer = await imgResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      imagePart = {
        inlineData: {
          data: base64,
          mimeType: "image/jpeg"
        }
      };
    }
    const fullPrompt = `${system_prompt}\n\nProduct Details:\n${user_message}\n\nWrite one compelling marketing paragraph.`;

    const parts: any[] = [
      { text: fullPrompt }
    ];
    
    if (imagePart) {
      parts.push(imagePart);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      throw new Error(data.error?.message || JSON.stringify(data));
    }

    const description = data.candidates[0].content.parts[0].text;

    return NextResponse.json({
      description,
      success: true
    });

  } catch (error: any) {
    console.error('LLM error:', error);
    return NextResponse.json(
      { error: error.message || 'LLM failed' },
      { status: 500 }
    );
  }
}