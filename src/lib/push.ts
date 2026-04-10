import webpush from 'web-push';
import { prisma } from './prisma';

try {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:amritafeast@cb.amrita.edu',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (error) {
  console.warn('VAPID keys not configured properly. Push notifications disabled during build/dev.');
}

export async function sendPushToStudent(
  studentId: string,
  title: string,
  body: string
) {
  try {
    const sub = await prisma.pushSubscription.findUnique({
      where: { studentId },
    });

    if (!sub) return;

    await webpush.sendNotification(
      JSON.parse(sub.subscription),
      JSON.stringify({
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
      })
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
}
