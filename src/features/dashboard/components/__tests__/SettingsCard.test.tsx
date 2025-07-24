import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsCard } from '../SettingsCard';

const mockIcon = (
  <svg data-testid="test-icon" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

describe('SettingsCard', () => {
  const defaultProps = {
    icon: mockIcon,
    title: 'Test Title',
    description: 'Test Description',
    buttonText: 'Test Button',
    buttonColor: 'blue' as const,
  };

  it('renders with basic props', () => {
    render(<SettingsCard {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const mockOnClick = jest.fn();
    render(<SettingsCard {...defaultProps} onClick={mockOnClick} />);
    
    const button = screen.getByText('Test Button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct color classes for different button colors', () => {
    const { rerender } = render(<SettingsCard {...defaultProps} buttonColor="blue" />);
    
    let button = screen.getByText('Test Button');
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    
    rerender(<SettingsCard {...defaultProps} buttonColor="red" />);
    button = screen.getByText('Test Button');
    expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700');
    
    rerender(<SettingsCard {...defaultProps} buttonColor="green" />);
    button = screen.getByText('Test Button');
    expect(button).toHaveClass('bg-green-600', 'hover:bg-green-700');
  });

  it('applies full width class when fullWidth is true', () => {
    render(<SettingsCard {...defaultProps} fullWidth={true} />);
    
    const card = screen.getByText('Test Title').closest('div');
    expect(card).toHaveClass('md:col-span-2');
  });

  it('applies red border for red button color', () => {
    render(<SettingsCard {...defaultProps} buttonColor="red" />);
    
    const card = screen.getByText('Test Title').closest('div');
    expect(card).toHaveClass('border-red-200');
  });

  it('applies gray border for non-red button colors', () => {
    render(<SettingsCard {...defaultProps} buttonColor="blue" />);
    
    const card = screen.getByText('Test Title').closest('div');
    expect(card).toHaveClass('border-gray-200');
  });

  it('renders children when provided instead of default content', () => {
    const customChildren = <div data-testid="custom-content">Custom Content</div>;
    
    render(
      <SettingsCard {...defaultProps}>
        {customChildren}
      </SettingsCard>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Button')).not.toBeInTheDocument();
  });

  it('has hover shadow effect', () => {
    render(<SettingsCard {...defaultProps} />);
    
    const card = screen.getByText('Test Title').closest('div');
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
  });

  it('displays icon with correct color classes', () => {
    render(<SettingsCard {...defaultProps} buttonColor="purple" />);
    
    const iconContainer = screen.getByTestId('test-icon').closest('div');
    expect(iconContainer).toHaveClass('bg-purple-100');
    
    const iconWrapper = screen.getByTestId('test-icon').parentElement;
    expect(iconWrapper).toHaveClass('text-purple-600');
  });

  it('has responsive padding', () => {
    render(<SettingsCard {...defaultProps} />);
    
    const card = screen.getByText('Test Title').closest('div');
    expect(card).toHaveClass('p-4', 'md:p-6');
  });
});
