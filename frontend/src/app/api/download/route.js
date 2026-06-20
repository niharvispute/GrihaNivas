import { NextResponse } from 'next/server';

const ALLOWED_HOST = 'res.cloudinary.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'brochure.pdf';

  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse('URL not allowed', { status: 403 });
  }

  let upstream;
  try {
    upstream = await fetch(url);
  } catch {
    return new NextResponse('Fetch failed', { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse('Upstream error', { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
