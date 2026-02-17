import { NextRequest, NextResponse } from 'next/server';

const TRANSLOADIT_AUTH_KEY = process.env.TRANSLOADIT_AUTH_KEY || '';
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, width, height } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!TRANSLOADIT_AUTH_KEY) {
      return NextResponse.json({ error: 'Auth key missing' }, { status: 500 });
    }

    const base64String = imageBase64.split(',')[1];
    if (!base64String) {
      return NextResponse.json({ error: 'Invalid base64' }, { status: 400 });
    }

    const buffer = Buffer.from(base64String, 'base64');
    const params = {
      auth: { key: TRANSLOADIT_AUTH_KEY },
      steps: {
        'resized': {
          robot: '/image/resize',
          use: ':original',
          width: width || 512,
          height: height || 512,
          resize_strategy: 'fit',
          imagemagick_stack: 'v3.0.1',
        },
        'optimized': {
          robot: '/image/optimize',
          use: 'resized',
          progressive: true,
        },
      },
    };

    console.log('🚀 Creating assembly...');

    const formData = new FormData();
    formData.append('params', JSON.stringify(params));
    formData.append('file', new Blob([buffer], { type: 'image/png' }), 'image.png');

    const response = await fetch('https://api2.transloadit.com/assemblies', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return NextResponse.json({ error: 'API failed', details: error }, { status: 500 });
    }

    const assemblyData = await response.json();
    console.log('Assembly:', assemblyData.assembly_id);
    const assemblyUrl = assemblyData.assembly_ssl_url || assemblyData.assembly_url;
    let attempts = 0;
    let finalData = null;

    while (attempts < 60) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;

      const statusRes = await fetch(assemblyUrl);
      const statusData = await statusRes.json();

      console.log(`Poll ${attempts}: ${statusData.ok}`);

      if (statusData.ok === 'ASSEMBLY_COMPLETED') {
        finalData = statusData;
        break;
      }

      if (statusData.error) {
        return NextResponse.json({ error: 'Assembly failed', details: statusData }, { status: 500 });
      }
    }

    if (!finalData) {
      return NextResponse.json({ error: 'Timeout' }, { status: 504 });
    }

    console.log('Completed!');
    console.log('Results:', JSON.stringify(finalData.results, null, 2));

    let imageUrl = 
      finalData.results?.optimized?.[0]?.ssl_url ||
      finalData.results?.optimized?.[0]?.url ||
      finalData.results?.resized?.[0]?.ssl_url ||
      finalData.results?.resized?.[0]?.url;
    if (!imageUrl && finalData.uploads && finalData.uploads.length > 0) {
      console.log('⚠️ No processed results, using original upload');
      imageUrl = finalData.uploads[0].ssl_url || finalData.uploads[0].url;
    }

    if (!imageUrl) {
      console.error('❌ No URL found');
      console.error('Full assembly:', finalData);
      return NextResponse.json({
        error: 'No image URL found',
        assemblyUrl: assemblyUrl,
        results: finalData.results,
        uploads: finalData.uploads,
      }, { status: 500 });
    }
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    return new NextResponse(imgBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'X-Assembly-Id': finalData.assembly_id,
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}