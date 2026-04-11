/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CafeteriaCard from '../CafeteriaCard';
import type { CafeteriaInfo } from '@/types';

const mockOpenCafeteria: CafeteriaInfo = {
  id: '1',
  name: 'Samridhi',
  location: 'Main Block',
  isOpen: true,
  avgWaitMinutes: 10,
};

const mockClosedCafeteria: CafeteriaInfo = {
  id: '2',
  name: 'Canteen Main',
  location: 'Admin Block',
  isOpen: false,
  avgWaitMinutes: 15,
};

describe('CafeteriaCard', () => {
  it('should render cafeteria name and location', () => {
    render(<CafeteriaCard cafeteria={mockOpenCafeteria} />);
    
    expect(screen.getByText('Samridhi')).toBeInTheDocument();
    expect(screen.getByText('Main Block')).toBeInTheDocument();
  });

  it('should display "Open Now" badge when cafeteria is open', () => {
    render(<CafeteriaCard cafeteria={mockOpenCafeteria} />);
    
    expect(screen.getByText('Open Now')).toBeInTheDocument();
  });

  it('should display "Closed" badge when cafeteria is closed', () => {
    render(<CafeteriaCard cafeteria={mockClosedCafeteria} />);
    
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should display wait time when cafeteria is open', () => {
    render(<CafeteriaCard cafeteria={mockOpenCafeteria} />);
    
    expect(screen.getByText('~10 min wait')).toBeInTheDocument();
  });

  it('should not display wait time when cafeteria is closed', () => {
    render(<CafeteriaCard cafeteria={mockClosedCafeteria} />);
    
    expect(screen.queryByText(/min wait/)).not.toBeInTheDocument();
  });

  it('should call onClick when open cafeteria is clicked', () => {
    const handleClick = jest.fn();
    render(<CafeteriaCard cafeteria={mockOpenCafeteria} onClick={handleClick} />);
    
    const card = screen.getByText('Samridhi').closest('div')?.parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('should not call onClick when closed cafeteria is clicked', () => {
    const handleClick = jest.fn();
    render(<CafeteriaCard cafeteria={mockClosedCafeteria} onClick={handleClick} />);
    
    const card = screen.getByText('Canteen Main').closest('div')?.parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
      expect(handleClick).not.toHaveBeenCalled();
    }
  });

  it('should apply 50% opacity when cafeteria is closed', () => {
    const { container } = render(<CafeteriaCard cafeteria={mockClosedCafeteria} />);
    
    const cardWrapper = container.firstChild as HTMLElement;
    expect(cardWrapper).toHaveStyle({ opacity: 0.5 });
  });

  it('should apply full opacity when cafeteria is open', () => {
    const { container } = render(<CafeteriaCard cafeteria={mockOpenCafeteria} />);
    
    const cardWrapper = container.firstChild as HTMLElement;
    expect(cardWrapper).toHaveStyle({ opacity: 1 });
  });
});
