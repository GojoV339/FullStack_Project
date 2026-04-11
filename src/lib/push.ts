import webpush from 'web-push';
import { prisma } from './prisma';

// Configure VAPID details for web-push
// VAPID (Voluntary Application Server Identification) authenticates push notifications
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

/**
 * Send a push notification to a student
 * Handles subscription errors gracefully without blocking order processing
 * 
 * @param studentId - The student's unique identifier
 * @param title - Notification title
 * @param body - Notification body text
 * @returns Promise<void>
 */
export async function sendPushNotification(
  studentId: string,
  title: string,
  body: string
): Promise<void> {
  try {
    // Fetch the student's push subscription
    const subscription = await prisma.pushSubscription.findUnique({
      where: { studentId },
    });

    // If user hasn't subscribed to push notifications, skip silently
    if (!subscription) {
      return;
    }

    // Send the push notification
    await webpush.sendNotification(
      JSON.parse(subscription.subscription),
      JSON.stringify({
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
      })
    );
  } catch (error: any) {
    // Log error but don't block order processing
    console.error('Push notification failed:', error);

    // Handle invalid/expired subscriptions (HTTP 410 Gone)
    // This occurs when the user has unsubscribed or the subscription expired
    if (error?.statusCode === 410) {
      try {
        await prisma.pushSubscription.delete({
          where: { studentId },
        });
        console.log(`Removed invalid push subscription for student: ${studentId}`);
      } catch (deleteError) {
        console.error('Failed to delete invalid subscription:', deleteError);
      }
    }
  }
}

/**
 * Legacy alias for sendPushNotification
 * @deprecated Use sendPushNotification instead
 */
export const sendPushToStudent = sendPushNotification;
