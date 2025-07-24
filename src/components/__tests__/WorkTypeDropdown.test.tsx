import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkTypeDropdown from '../WorkTypeDropdown';

const mockOnChange = jest.fn();

const defaultProps = {
  value: [],
  onChange: mockOnChange,
  placeholder: 'Chọn loại công việc',
};

describe('WorkTypeDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder when no value', () => {
    render(<WorkTypeDropdown {...defaultProps} />);
    
    expect(screen.getByText('Chọn loại công việc')).toBeInTheDocument();
  });

  it('shows label when provided', () => {
    render(<WorkTypeDropdown {...defaultProps} label="Loại công việc" />);
    
    expect(screen.getByText('Loại công việc')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<WorkTypeDropdown {...defaultProps} label="Loại công việc" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Should show search input
    expect(screen.getByPlaceholderText('Tìm kiếm loại công việc...')).toBeInTheDocument();
    
    // Should show category headers
    expect(screen.getByText('SBG')).toBeInTheDocument();
    expect(screen.getByText('ĐỐI TÁC')).toBeInTheDocument();
    expect(screen.getByText('KTS')).toBeInTheDocument();
    expect(screen.getByText('KHÁCH HÀNG')).toBeInTheDocument();
  });

  it('displays selected options as badges', () => {
    render(<WorkTypeDropdown {...defaultProps} value={['sbg-new', 'partner-old']} />);
    
    expect(screen.getByText('SBG mới')).toBeInTheDocument();
    expect(screen.getByText('Đối tác cũ')).toBeInTheDocument();
  });

  it('allows removing selected options', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} value={['sbg-new']} />);
    
    // Find and click the remove button on the badge
    const removeButton = screen.getByRole('button', { name: /×/ });
    await user.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('allows selecting options from dropdown', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Click on an option
    const option = screen.getByText('SBG mới');
    await user.click(option);
    
    expect(mockOnChange).toHaveBeenCalledWith(['sbg-new']);
  });

  it('supports search functionality', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Type in search
    const searchInput = screen.getByPlaceholderText('Tìm kiếm loại công việc...');
    await user.type(searchInput, 'SBG');
    
    // Should show only SBG options
    expect(screen.getByText('SBG mới')).toBeInTheDocument();
    expect(screen.getByText('SBG cũ')).toBeInTheDocument();
    expect(screen.queryByText('Đối tác mới')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Type search that has no matches
    const searchInput = screen.getByPlaceholderText('Tìm kiếm loại công việc...');
    await user.type(searchInput, 'xyz');
    
    expect(screen.getByText('Không tìm thấy loại công việc phù hợp')).toBeInTheDocument();
  });

  it('allows clearing all selections', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} value={['sbg-new', 'partner-old']} />);
    
    // Find and click the clear all button
    const clearButton = screen.getByTitle('Xóa tất cả');
    await user.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <WorkTypeDropdown {...defaultProps} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    
    // Open dropdown
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Verify dropdown is open
    expect(screen.getByPlaceholderText('Tìm kiếm loại công việc...')).toBeInTheDocument();
    
    // Click outside
    await user.click(screen.getByTestId('outside'));
    
    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Tìm kiếm loại công việc...')).not.toBeInTheDocument();
    });
  });

  it('shows check mark for selected options in dropdown', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} value={['sbg-new']} />);
    
    // Open dropdown
    const trigger = screen.getByText('SBG mới');
    await user.click(trigger);
    
    // Should show check mark for selected option
    // This would require checking for the Check icon component
    // The exact implementation depends on how the Check icon is rendered
  });

  it('handles disabled state', () => {
    render(<WorkTypeDropdown {...defaultProps} disabled />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });

  it('shows selection count in footer when options are selected', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} value={['sbg-new', 'partner-old']} />);
    
    // Open dropdown
    const trigger = screen.getByText('SBG mới');
    await user.click(trigger);
    
    // Should show selection count
    expect(screen.getByText('Đã chọn 2 loại công việc')).toBeInTheDocument();
  });

  it('supports multiple selection and deselection', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} value={['sbg-new']} />);
    
    // Open dropdown
    const trigger = screen.getByText('SBG mới');
    await user.click(trigger);
    
    // Select another option
    const partnerOption = screen.getByText('Đối tác mới');
    await user.click(partnerOption);
    
    expect(mockOnChange).toHaveBeenCalledWith(['sbg-new', 'partner-new']);
    
    // Deselect first option
    const sbgOption = screen.getByText('SBG mới');
    await user.click(sbgOption);
    
    expect(mockOnChange).toHaveBeenCalledWith(['partner-new']);
  });

  it('focuses search input when dropdown opens', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Search input should be focused
    const searchInput = screen.getByPlaceholderText('Tìm kiếm loại công việc...');
    expect(searchInput).toHaveFocus();
  });

  it('shows category organization correctly', async () => {
    const user = userEvent.setup();
    render(<WorkTypeDropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Chọn loại công việc');
    await user.click(trigger);
    
    // Should show all categories
    expect(screen.getByText('SBG')).toBeInTheDocument();
    expect(screen.getByText('ĐỐI TÁC')).toBeInTheDocument();
    expect(screen.getByText('KTS')).toBeInTheDocument();
    expect(screen.getByText('KHÁCH HÀNG')).toBeInTheDocument();
    expect(screen.getByText('KHÁC')).toBeInTheDocument();
    
    // Should show options under correct categories
    expect(screen.getByText('SBG mới')).toBeInTheDocument();
    expect(screen.getByText('Đối tác mới')).toBeInTheDocument();
    expect(screen.getByText('KTS mới')).toBeInTheDocument();
    expect(screen.getByText('Khách hàng mới')).toBeInTheDocument();
    expect(screen.getByText('Công việc khác')).toBeInTheDocument();
  });
});
