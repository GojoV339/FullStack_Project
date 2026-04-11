import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cafeterias = await prisma.cafeteria.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
        isOpen: true,
        avgWaitMinutes: true,
      },
    });

    return NextResponse.json({ cafeterias });
  } catch (error) {
    return handleApiError(error, 'Cafeterias Fetch', {
      endpoint: '/api/cafeterias',
    });
  }
}
