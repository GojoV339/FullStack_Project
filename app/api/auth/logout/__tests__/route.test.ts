import { POST } from '../route';

describe('POST /api/auth/logout', () => {
  it('should return success response', async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should clear authentication cookie', async () => {
    const response = await POST();

    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('token=');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader?.toLowerCase()).toContain('samesite=lax');
  });

  it('should set cookie maxAge to 0 to expire immediately', async () => {
    const response = await POST();

    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader?.toLowerCase()).toContain('max-age=0');
  });

  it('should set secure flag in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const response = await POST();
    const setCookieHeader = response.headers.get('set-cookie');

    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader?.toLowerCase()).toContain('secure');

    process.env.NODE_ENV = originalEnv;
  });

  it('should not set secure flag in development environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const response = await POST();
    const setCookieHeader = response.headers.get('set-cookie');

    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader?.toLowerCase()).not.toContain('secure');

    process.env.NODE_ENV = originalEnv;
  });
});
