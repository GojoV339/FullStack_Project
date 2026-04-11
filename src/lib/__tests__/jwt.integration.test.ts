/**
 * Integration tests for JWT authentication flow
 * These tests verify the complete authentication workflow
 */

import { signToken, verifyToken } from '../jwt';

describe('JWT Integration Tests', () => {
  describe('Student Authentication Flow', () => {
    it('should complete full student authentication cycle', async () => {
      // Step 1: Student scans barcode and system creates JWT
      const studentPayload = {
        sub: 'clx123456789',
        role: 'student' as const,
        registrationNumber: 'AM.EN.U4CSE21001',
      };

      const token = await signToken(studentPayload);
      expect(token).toBeDefined();

      // Step 2: Token is stored in httpOnly cookie (simulated)
      // In real app: response.cookies.set('token', token, { httpOnly: true, ... })

      // Step 3: Subsequent requests verify the token
      const verified = await verifyToken(token);
      expect(verified).toBeDefined();
      expect(verified?.sub).toBe(studentPayload.sub);
      expect(verified?.role).toBe('student');
      expect(verified?.registrationNumber).toBe(studentPayload.registrationNumber);

      // Step 4: Verify token has correct expiry (7 days)
      const now = Math.floor(Date.now() / 1000);
      const sevenDays = 7 * 24 * 60 * 60;
      const expiryDiff = (verified!.exp as number) - now;
      expect(expiryDiff).toBeGreaterThan(sevenDays - 10);
      expect(expiryDiff).toBeLessThanOrEqual(sevenDays + 10);
    });

    it('should reject invalid student tokens', async () => {
      // Simulate tampered or invalid token
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      
      const verified = await verifyToken(invalidToken);
      expect(verified).toBeNull();
    });
  });

  describe('Staff Authentication Flow', () => {
    it('should complete full staff authentication cycle', async () => {
      // Step 1: Staff logs in with email/password and system creates JWT
      const staffPayload = {
        sub: 'clx987654321',
        role: 'staff' as const,
        cafeteriaId: 'clx-cafeteria-samridhi',
      };

      const token = await signToken(staffPayload);
      expect(token).toBeDefined();

      // Step 2: Token is stored in httpOnly cookie
      // In real app: response.cookies.set('token', token, { httpOnly: true, ... })

      // Step 3: Staff accesses kitchen dashboard, token is verified
      const verified = await verifyToken(token);
      expect(verified).toBeDefined();
      expect(verified?.sub).toBe(staffPayload.sub);
      expect(verified?.role).toBe('staff');
      expect(verified?.cafeteriaId).toBe(staffPayload.cafeteriaId);

      // Step 4: Verify token has correct expiry (7 days)
      const now = Math.floor(Date.now() / 1000);
      const sevenDays = 7 * 24 * 60 * 60;
      const expiryDiff = (verified!.exp as number) - now;
      expect(expiryDiff).toBeGreaterThan(sevenDays - 10);
      expect(expiryDiff).toBeLessThanOrEqual(sevenDays + 10);
    });

    it('should reject invalid staff tokens', async () => {
      const invalidToken = 'not.a.valid.jwt.token';
      
      const verified = await verifyToken(invalidToken);
      expect(verified).toBeNull();
    });
  });

  describe('Role-based Access Control', () => {
    it('should distinguish between student and staff roles', async () => {
      const studentToken = await signToken({
        sub: 'student-id',
        role: 'student' as const,
        registrationNumber: 'AM.EN.U4CSE21001',
      });

      const staffToken = await signToken({
        sub: 'staff-id',
        role: 'staff' as const,
        cafeteriaId: 'cafeteria-id',
      });

      const studentVerified = await verifyToken(studentToken);
      const staffVerified = await verifyToken(staffToken);

      expect(studentVerified?.role).toBe('student');
      expect(staffVerified?.role).toBe('staff');

      // Verify role-specific fields
      expect(studentVerified?.registrationNumber).toBeDefined();
      expect(studentVerified?.cafeteriaId).toBeUndefined();

      expect(staffVerified?.cafeteriaId).toBeDefined();
      expect(staffVerified?.registrationNumber).toBeUndefined();
    });
  });

  describe('Token Expiry Handling', () => {
    it('should include expiry information in token', async () => {
      const payload = {
        sub: 'user-id',
        role: 'student' as const,
      };

      const token = await signToken(payload);
      const verified = await verifyToken(token);

      expect(verified?.exp).toBeDefined();
      expect(verified?.iat).toBeDefined();
      expect((verified!.exp as number) > (verified!.iat as number)).toBe(true);
    });

    it('should set expiry exactly 7 days from issuance', async () => {
      const payload = {
        sub: 'user-id',
        role: 'student' as const,
      };

      const token = await signToken(payload);
      const verified = await verifyToken(token);

      const expiryDuration = (verified!.exp as number) - (verified!.iat as number);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      // Should be exactly 7 days (604800 seconds)
      expect(expiryDuration).toBe(sevenDaysInSeconds);
    });
  });

  describe('Security Requirements', () => {
    it('should use HS256 algorithm for signing', async () => {
      const payload = {
        sub: 'user-id',
        role: 'student' as const,
      };

      const token = await signToken(payload);
      
      // Decode header to verify algorithm
      const [headerB64] = token.split('.');
      const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
      
      expect(header.alg).toBe('HS256');
    });

    it('should create unique tokens for each sign operation', async () => {
      const payload = {
        sub: 'user-id',
        role: 'student' as const,
      };

      const token1 = await signToken(payload);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token2 = await signToken(payload);

      // Tokens should be different due to different iat
      expect(token1).not.toBe(token2);

      // But both should be valid
      const verified1 = await verifyToken(token1);
      const verified2 = await verifyToken(token2);

      expect(verified1).toBeDefined();
      expect(verified2).toBeDefined();
    });
  });
});
