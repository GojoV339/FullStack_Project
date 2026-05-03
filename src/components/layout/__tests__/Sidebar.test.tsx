/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';
import { useAuthStore } from '@/store/authStore';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock auth store
jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('Sidebar', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/cafeteria');
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      student: {
        id: '1',
        registrationNumber: 'AM.EN.U4CSE21001',
        name: 'Test Student',
        phone: null,
        subscriptionStatus: 'INACTIVE',
        subscriptionExpiry: null,
      },
      logout: mockLogout,
    });
  });

  it('should render user profile section', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Test Student')).toBeInTheDocument();
    expect(screen.getByText('AM.EN.U4CSE21001')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    (usePathname as jest.Mock).mockReturnValue('/cafeteria');
    render(<Sidebar />);
    
    const homeLink = screen.getByText('Home').closest('div');
    expect(homeLink).toHaveClass('text-[#2D2D2D]');
  });

  it('should render logout button', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call logout and redirect on logout button click', async () => {
    mockLogout.mockResolvedValue(undefined);
    
    render(<Sidebar />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Wait for async logout to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should display fallback text when student is not logged in', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      student: null,
      logout: mockLogout,
    });
    
    render(<Sidebar />);
    
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('should only display on desktop (hidden on mobile)', () => {
    const { container } = render(<Sidebar />);
    
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('hidden', 'md:flex');
  });
});
