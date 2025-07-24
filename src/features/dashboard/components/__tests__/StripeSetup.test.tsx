import { render, screen, fireEvent } from '@testing-library/react';
import { StripeSetup } from '../StripeSetup';

describe('StripeSetup', () => {
  it('renders Stripe setup button', () => {
    render(<StripeSetup />);

    expect(screen.getByText('Thiết lập Stripe')).toBeInTheDocument();
  });

  it('displays Creator Agreement text and link', () => {
    render(<StripeSetup />);

    expect(screen.getByText(/Bằng cách nhấp, bạn đồng ý với/)).toBeInTheDocument();
    expect(screen.getByText('Thỏa thuận Người tạo')).toBeInTheDocument();

    const agreementLink = screen.getByText('Thỏa thuận Người tạo');
    expect(agreementLink).toHaveAttribute('href', '#');
  });

  it('calls onSetup callback when button is clicked', () => {
    const mockOnSetup = jest.fn();
    render(<StripeSetup onSetup={mockOnSetup} />);

    const setupButton = screen.getByText('Thiết lập Stripe');
    fireEvent.click(setupButton);

    expect(mockOnSetup).toHaveBeenCalledTimes(1);
  });

  it('logs setup message when button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<StripeSetup />);

    const setupButton = screen.getByText('Thiết lập Stripe');
    fireEvent.click(setupButton);

    expect(consoleSpy).toHaveBeenCalledWith('Đang thiết lập Stripe...');

    consoleSpy.mockRestore();
  });

  it('works without onSetup callback', () => {
    render(<StripeSetup />);

    const setupButton = screen.getByText('Thiết lập Stripe');

    // Should not throw error when clicked without callback
    expect(() => fireEvent.click(setupButton)).not.toThrow();
  });

  it('has correct button styling', () => {
    render(<StripeSetup />);

    const setupButton = screen.getByText('Thiết lập Stripe');
    expect(setupButton).toHaveClass(
      'bg-blue-600',
      'text-white',
      'px-6',
      'py-2',
      'rounded-lg',
      'font-medium',
      'hover:bg-blue-700',
      'transition-colors'
    );
  });

  it('has correct layout structure', () => {
    render(<StripeSetup />);

    const container = screen.getByText('Thiết lập Stripe').closest('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-end', 'space-y-2');
  });
});
