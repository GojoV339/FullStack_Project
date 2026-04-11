import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    cafeteria: {
      findMany: jest.fn(),
    },
  },
}));

describe('GET /api/cafeterias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all cafeterias with required fields', async () => {
    const mockCafeterias = [
      {
        id: 'cafeteria-1',
        name: 'Samridhi',
        location: 'Main Block',
        isOpen: true,
        avgWaitMinutes: 10,
      },
      {
        id: 'cafeteria-2',
        name: 'Canteen Main',
        location: 'Admin Block',
        isOpen: true,
        avgWaitMinutes: 15,
      },
      {
        id: 'cafeteria-3',
        name: 'E Block Canteen',
        location: 'E Block',
        isOpen: false,
        avgWaitMinutes: 12,
      },
    ];

    (prisma.cafeteria.findMany as jest.Mock).mockResolvedValue(mockCafeterias);

    const response = await GET();
    const data = await response.json();

    expect(prisma.cafeteria.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
        isOpen: true,
        avgWaitMinutes: true,
      },
    });

    expect(response.status).toBe(200);
    expect(data).toEqual({ cafeterias: mockCafeterias });
  });

  it('should return cafeterias ordered by name', async () => {
    const mockCafeterias = [
      { id: '1', name: 'Canteen Main', location: 'Admin Block', isOpen: true, avgWaitMinutes: 15 },
      { id: '2', name: 'E Block Canteen', location: 'E Block', isOpen: false, avgWaitMinutes: 12 },
      { id: '3', name: 'Samridhi', location: 'Main Block', isOpen: true, avgWaitMinutes: 10 },
    ];

    (prisma.cafeteria.findMany as jest.Mock).mockResolvedValue(mockCafeterias);

    const response = await GET();
    const data = await response.json();

    expect(data.cafeterias).toEqual(mockCafeterias);
    expect(data.cafeterias[0].name).toBe('Canteen Main');
  });

  it('should include isOpen status for each cafeteria', async () => {
    const mockCafeterias = [
      { id: '1', name: 'Samridhi', location: 'Main Block', isOpen: true, avgWaitMinutes: 10 },
      { id: '2', name: 'E Block Canteen', location: 'E Block', isOpen: false, avgWaitMinutes: 12 },
    ];

    (prisma.cafeteria.findMany as jest.Mock).mockResolvedValue(mockCafeterias);

    const response = await GET();
    const data = await response.json();

    expect(data.cafeterias[0].isOpen).toBe(true);
    expect(data.cafeterias[1].isOpen).toBe(false);
  });

  it('should include avgWaitMinutes for each cafeteria', async () => {
    const mockCafeterias = [
      { id: '1', name: 'Samridhi', location: 'Main Block', isOpen: true, avgWaitMinutes: 10 },
      { id: '2', name: 'Canteen Main', location: 'Admin Block', isOpen: true, avgWaitMinutes: 15 },
    ];

    (prisma.cafeteria.findMany as jest.Mock).mockResolvedValue(mockCafeterias);

    const response = await GET();
    const data = await response.json();

    expect(data.cafeterias[0].avgWaitMinutes).toBe(10);
    expect(data.cafeterias[1].avgWaitMinutes).toBe(15);
  });

  it('should handle database errors gracefully', async () => {
    (prisma.cafeteria.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('should return empty array when no cafeterias exist', async () => {
    (prisma.cafeteria.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ cafeterias: [] });
  });
});
