import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payload: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        payload[key] = { name: value.name, size: value.size, type: value.type };
      } else {
        payload[key] = value;
      }
    });

    console.log('Quote request:', payload);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}