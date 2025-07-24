import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePicker from '../DatePicker';

const mockOnChange = jest.fn();

const defaultProps = {
  value: '',
  onChange: mockOnChange,
  placeholder: 'Select date',
};

describe('DatePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder when no value', () => {
    render(<DatePicker {...defaultProps} />);
    
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided', () => {
    const testDate = '2025-01-15';
    render(<DatePicker {...defaultProps} value={testDate} />);
    
    // Should display formatted Vietnamese date
    expect(screen.getByText(/Thứ Tư, 15 tháng 1 2025/)).toBeInTheDocument();
  });

  it('opens calendar when clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    const dateInput = screen.getByText('Select date');
    await user.click(dateInput);
    
    // Calendar should be visible
    expect(screen.getByText(/tháng/)).toBeInTheDocument(); // Month header
    expect(screen.getByText('CN')).toBeInTheDocument(); // Sunday header
  });

  it('shows current month by default', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    const currentMonth = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it('navigates between months', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    // Click next month button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    // Should show next month
    // You'd need to verify the month changed
  });

  it('highlights today', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    const today = new Date().getDate();
    const todayButton = screen.getByText(today.toString());
    
    // Today should have special styling
    expect(todayButton).toHaveClass('bg-blue-500/20');
  });

  it('selects date when clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    // Click on day 15
    const day15 = screen.getByText('15');
    await user.click(day15);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringMatching(/2025-\d{2}-15/)
      );
    });
  });

  it('uses quick action buttons', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    // Click "Today" button
    const todayButton = screen.getByText('Hôm nay');
    await user.click(todayButton);
    
    const today = new Date().toISOString().split('T')[0];
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(today);
    });
  });

  it('uses tomorrow quick action', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    // Click "Tomorrow" button
    const tomorrowButton = screen.getByText('Ngày mai');
    await user.click(tomorrowButton);
    
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(tomorrow);
    });
  });

  it('respects minDate constraint', async () => {
    const user = userEvent.setup();
    const minDate = '2025-01-15';
    render(<DatePicker {...defaultProps} minDate={minDate} />);
    
    await user.click(screen.getByText('Select date'));
    
    // Days before minDate should be disabled
    const day10 = screen.getByText('10');
    expect(day10).toBeDisabled();
    
    // Days after minDate should be enabled
    const day20 = screen.getByText('20');
    expect(day20).not.toBeDisabled();
  });

  it('closes calendar when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DatePicker {...defaultProps} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    
    // Open calendar
    await user.click(screen.getByText('Select date'));
    expect(screen.getByText('Hôm nay')).toBeInTheDocument();
    
    // Click outside
    await user.click(screen.getByTestId('outside'));
    
    await waitFor(() => {
      expect(screen.queryByText('Hôm nay')).not.toBeInTheDocument();
    });
  });

  it('shows label when provided', () => {
    render(<DatePicker {...defaultProps} label="Start Date" />);
    
    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<DatePicker {...defaultProps} label="Start Date" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('closes calendar after date selection', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);
    
    await user.click(screen.getByText('Select date'));
    
    // Select a date
    const day15 = screen.getByText('15');
    await user.click(day15);
    
    // Calendar should close
    await waitFor(() => {
      expect(screen.queryByText('Hôm nay')).not.toBeInTheDocument();
    });
  });
});
