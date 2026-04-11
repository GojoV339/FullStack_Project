import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { handleApiError } from '@/lib/api-error';

export async function GET(
  request: NextRequest,
  { params }: { params: { cafeteriaId: string } }
) {
  try {
    const { cafeteriaId } = params;

    // Check if student is logged in (for subscription status)
    const session = await getStudentSession();
    let isSubscribed = false;

    if (session) {
      const student = await prisma.student.findUnique({
        where: { id: session.sub },
        select: { subscriptionStatus: true },
      });
      isSubscribed = student?.subscriptionStatus === 'ACTIVE';
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { cafeteriaId, isAvailable: true },
      orderBy: [{ isCombo: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });

    const combos = menuItems.filter((item) => item.isCombo);
    const snacks = menuItems.filter(
      (item) => item.section === 'SNACK' && !item.isCombo
    );
    const cookToOrder = menuItems.filter(
      (item) => item.section === 'COOK_TO_ORDER' && !item.isCombo
    );
    const specialOffers = menuItems.filter((item) => item.isPriorityOnly);

    // Convert Decimal to number for JSON serialization
    const serialize = (items: typeof menuItems) =>
      items.map((item) => ({
        ...item,
        price: Number(item.price),
      }));

    return NextResponse.json({
      combos: serialize(combos),
      snacks: serialize(snacks),
      cookToOrder: serialize(cookToOrder),
      specialOffers: serialize(specialOffers),
      isSubscribed,
    });
  } catch (error) {
    return handleApiError(error, 'Menu Fetch', {
      endpoint: '/api/menu/[cafeteriaId]',
      cafeteriaId: params.cafeteriaId,
    });
  }
}
