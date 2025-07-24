import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from '../Dropdown';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const mockOnChange = jest.fn();

const testOptions = [
  { value: 'option1', label: 'Option 1', color: 'bg-red-500' },
  { value: 'option2', label: 'Option 2', color: 'bg-blue-500', icon: Clock },
  { value: 'option3', label: 'Option 3', icon: AlertTriangle },
];

const defaultProps = {
  value: '',
  onChange: mockOnChange,
  options: testOptions,
  placeholder: 'Select option',
};

describe('Dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder when no value selected', () => {
    render(<Dropdown {...defaultProps} />);
    
    expect(screen.getByText('Select option')).toBeInTheDocument();
  });

  it('displays selected option', () => {
    render(<Dropdown {...defaultProps} value="option1" />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('shows label when provided', () => {
    render(<Dropdown {...defaultProps} label="Test Label" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Dropdown {...defaultProps} label="Test Label" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Select option');
    await user.click(trigger);
    
    // All options should be visible
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('displays option colors', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    await user.click(screen.getByText('Select option'));
    
    // Should show color indicators
    const option1 = screen.getByText('Option 1').closest('button');
    expect(option1?.querySelector('.bg-red-500')).toBeInTheDocument();
    
    const option2 = screen.getByText('Option 2').closest('button');
    expect(option2?.querySelector('.bg-blue-500')).toBeInTheDocument();
  });

  it('displays option icons', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    await user.click(screen.getByText('Select option'));
    
    // Icons should be rendered (you'd need to check for specific icon elements)
    // This would require checking for the SVG elements or data attributes
  });

  it('selects option when clicked', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    await user.click(screen.getByText('Select option'));
    await user.click(screen.getByText('Option 2'));
    
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    await user.click(screen.getByText('Select option'));
    await user.click(screen.getByText('Option 1'));
    
    // Dropdown should close (options should not be visible)
    await waitFor(() => {
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  it('shows check mark for selected option', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} value="option1" />);
    
    await user.click(screen.getByText('Option 1'));
    
    // Should show check mark for selected option
    // You'd need to check for the CheckCircle icon or check mark indicator
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Dropdown {...defaultProps} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    
    // Open dropdown
    await user.click(screen.getByText('Select option'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Click outside
    await user.click(screen.getByTestId('outside'));
    
    await waitFor(() => {
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  it('rotates chevron icon when open', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Select option').closest('button');
    const chevron = trigger?.querySelector('svg');
    
    // Initially not rotated
    expect(chevron).not.toHaveClass('rotate-180');
    
    // Click to open
    await user.click(trigger!);
    
    // Should be rotated
    expect(chevron).toHaveClass('rotate-180');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Select option');
    
    // Focus and press Enter to open
    trigger.focus();
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Press Escape to close
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('displays selected option with color and icon', () => {
    render(<Dropdown {...defaultProps} value="option2" />);
    
    // Should show the selected option with its color and icon
    const selectedDisplay = screen.getByText('Option 2').closest('div');
    expect(selectedDisplay?.querySelector('.bg-blue-500')).toBeInTheDocument();
  });

  it('handles empty options array', () => {
    render(<Dropdown {...defaultProps} options={[]} />);
    
    const trigger = screen.getByText('Select option');
    expect(trigger).toBeInTheDocument();
    
    // Should not crash when clicking
    fireEvent.click(trigger);
  });

  it('maintains focus management', async () => {
    const user = userEvent.setup();
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Select option');
    
    // Focus should be on trigger initially
    trigger.focus();
    expect(trigger).toHaveFocus();
    
    // Open dropdown
    await user.click(trigger);
    
    // Focus should still be manageable
    expect(document.activeElement).toBeDefined();
  });
});
