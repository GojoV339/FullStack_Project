import { sendPushNotification, sendPushToStudent } from '../push';
import { prisma } from '../prisma';
import webpush from 'web-push';

// Mock dependencies
jest.mock('../prisma', () => ({
  prisma: {
    pushSubscription: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

describe('Push Notification Module', () => {
  const mockStudentId = 'student-123';
  const mockTitle = 'Test Notification';
  const mockBody = 'This is a test notification';
  const mockSubscription = {
    studentId: mockStudentId,
    subscription: JSON.stringify({
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPushNotification', () => {
    it('should send push notification successfully', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (webpush.sendNotification as jest.Mock).mockResolvedValue(undefined);

      await sendPushNotification(mockStudentId, mockTitle, mockBody);

      expect(prisma.pushSubscription.findUnique).toHaveBeenCalledWith({
        where: { studentId: mockStudentId },
      });

      expect(webpush.sendNotification).toHaveBeenCalledWith(
        JSON.parse(mockSubscription.subscription),
        JSON.stringify({
          title: mockTitle,
          body: mockBody,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
        })
      );
    });

    it('should skip silently when student has no subscription', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      await sendPushNotification(mockStudentId, mockTitle, mockBody);

      expect(prisma.pushSubscription.findUnique).toHaveBeenCalledWith({
        where: { studentId: mockStudentId },
      });

      expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it('should handle 410 Gone error by deleting invalid subscription', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      
      const error410 = new Error('Subscription expired');
      (error410 as any).statusCode = 410;
      (webpush.sendNotification as jest.Mock).mockRejectedValue(error410);
      (prisma.pushSubscription.delete as jest.Mock).mockResolvedValue(undefined);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendPushNotification(mockStudentId, mockTitle, mockBody);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Push notification failed:', error410);
      expect(prisma.pushSubscription.delete).toHaveBeenCalledWith({
        where: { studentId: mockStudentId },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Removed invalid push subscription for student: ${mockStudentId}`
      );

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should log error but not throw when push notification fails', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      
      const testError = new Error('Network error');
      (webpush.sendNotification as jest.Mock).mockRejectedValue(testError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendPushNotification(mockStudentId, mockTitle, mockBody);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Push notification failed:', testError);
      expect(prisma.pushSubscription.delete).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle database errors when fetching subscription', async () => {
      const dbError = new Error('Database connection failed');
      (prisma.pushSubscription.findUnique as jest.Mock).mockRejectedValue(dbError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendPushNotification(mockStudentId, mockTitle, mockBody);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Push notification failed:', dbError);
      expect(webpush.sendNotification).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when deleting invalid subscription', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      
      const error410 = new Error('Subscription expired');
      (error410 as any).statusCode = 410;
      (webpush.sendNotification as jest.Mock).mockRejectedValue(error410);
      
      const deleteError = new Error('Delete failed');
      (prisma.pushSubscription.delete as jest.Mock).mockRejectedValue(deleteError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendPushNotification(mockStudentId, mockTitle, mockBody);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Push notification failed:', error410);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete invalid subscription:', deleteError);

      consoleErrorSpy.mockRestore();
    });

    it('should include correct notification payload structure', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (webpush.sendNotification as jest.Mock).mockResolvedValue(undefined);

      await sendPushNotification(mockStudentId, 'Order Ready', 'Your food is ready for pickup!');

      const expectedPayload = JSON.stringify({
        title: 'Order Ready',
        body: 'Your food is ready for pickup!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
      });

      expect(webpush.sendNotification).toHaveBeenCalledWith(
        expect.any(Object),
        expectedPayload
      );
    });
  });

  describe('sendPushToStudent (legacy alias)', () => {
    it('should work as an alias for sendPushNotification', async () => {
      (prisma.pushSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (webpush.sendNotification as jest.Mock).mockResolvedValue(undefined);

      await sendPushToStudent(mockStudentId, mockTitle, mockBody);

      expect(prisma.pushSubscription.findUnique).toHaveBeenCalledWith({
        where: { studentId: mockStudentId },
      });

      expect(webpush.sendNotification).toHaveBeenCalled();
    });
  });

  describe('VAPID Configuration', () => {
    it('should handle missing VAPID keys gracefully', () => {
      // This test verifies that the module loads without throwing
      // even when VAPID keys are not configured
      expect(() => require('../push')).not.toThrow();
    });
  });
});
