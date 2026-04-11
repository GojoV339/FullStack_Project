import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { createOrderSchema } from '@/lib/validations';
import { createCashfreeOrder } from '@/lib/cashfree';
import { handleApiError, errorResponse } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const parsed = createOrderSchema.parse(body);

    const { cafeteriaId, items } = parsed;

    // Verify cafeteria exists and is open
    const cafeteria = await prisma.cafeteria.findUnique({
      where: { id: cafeteriaId },
    });

    if (!cafeteria || !cafeteria.isOpen) {
      return errorResponse(
        'Cafeteria is not available',
        400,
        'CAFETERIA_UNAVAILABLE'
      );
    }

    // Fetch menu items and validate they belong to this cafeteria
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        cafeteriaId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return errorResponse(
        'Some menu items are not available',
        400,
        'ITEMS_UNAVAILABLE'
      );
    }

    // Calculate total from DB prices (never trust client)
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      const unitPrice = Number(menuItem.price);
      totalAmount += unitPrice * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    // Generate token number (daily sequential)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastOrder = await prisma.order.findFirst({
      where: {
        cafeteriaId,
        createdAt: { gte: today },
      },
      orderBy: { tokenNumber: 'desc' },
    });

    const tokenNumber = (lastOrder?.tokenNumber ?? 0) + 1;

    // Generate Order_Number in format "AF-YYYY-####"
    const year = new Date().getFullYear();
    const lastOrderNumber = await prisma.order.findFirst({
      where: {
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    });

    let dailyCounter = 1;
    if (lastOrderNumber?.orderNumber) {
      const match = lastOrderNumber.orderNumber.match(/^AF-\d{4}-(\d{4})$/);
      if (match) {
        dailyCounter = parseInt(match[1], 10) + 1;
      }
    }

    const orderNumber = `AF-${year}-${dailyCounter.toString().padStart(4, '0')}`;

    // Create order with 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        studentId: session.sub,
        cafeteriaId,
        tokenNumber,
        totalAmount,
        expiresAt,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { menuItem: true } },
        cafeteria: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        studentId: session.sub,
        type: 'ORDER',
        amount: totalAmount,
      },
    });

    // Create Cashfree order
    const student = await prisma.student.findUnique({
      where: { id: session.sub },
    });

    let cashfreeSessionId = '';
    try {
      const cashfreeOrder = await createCashfreeOrder({
        orderId: order.id,
        orderAmount: totalAmount,
        studentId: student!.id,
        studentName: student!.name ?? 'Student',
        studentPhone: student!.phone ?? '9999999999',
        studentEmail: `${student!.registrationNumber}@cb.amrita.edu`,
      });
      cashfreeSessionId = cashfreeOrder.payment_session_id || '';
    } catch (err) {
      console.error('Cashfree order creation failed:', err);
      // Continue without Cashfree in dev mode
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        tokenNumber: order.tokenNumber,
        totalAmount: Number(order.totalAmount),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        expiresAt: order.expiresAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        cafeteria: {
          id: order.cafeteria.id,
          name: order.cafeteria.name,
          location: order.cafeteria.location,
        },
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            category: item.menuItem.category,
            imageUrl: item.menuItem.imageUrl,
          },
        })),
      },
      cashfreeSessionId,
    });
  } catch (error) {
    return handleApiError(error, 'Order Creation', {
      endpoint: '/api/orders',
      studentId: (await getStudentSession())?.sub,
    });
  }
}
