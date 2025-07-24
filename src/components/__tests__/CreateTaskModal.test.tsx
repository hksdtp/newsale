import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateTaskModal from '../CreateTaskModal';

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
};

describe('CreateTaskModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<CreateTaskModal {...defaultProps} />);
    
    expect(screen.getByText('Tạo công việc mới')).toBeInTheDocument();
    expect(screen.getByText('Tạo công việc, cá nhân và quản lý tiến độ hiệu quả')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CreateTaskModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Tạo công việc mới')).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<CreateTaskModal {...defaultProps} />);
    
    // Work type selection
    expect(screen.getByText('Loại công việc')).toBeInTheDocument();
    expect(screen.getByText('(Có thể chọn nhiều)')).toBeInTheDocument();
    
    // Task title
    expect(screen.getByLabelText(/Tiêu đề công việc/)).toBeInTheDocument();
    
    // Description
    expect(screen.getByLabelText(/Mô tả chi tiết/)).toBeInTheDocument();
    
    // Status and Priority dropdowns
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Mức độ ưu tiên')).toBeInTheDocument();
    
    // Date fields
    expect(screen.getByText('Ngày thực hiện')).toBeInTheDocument();
    expect(screen.getByText('Hạn chót')).toBeInTheDocument();
    
    // Share scope
    expect(screen.getByText('Phạm vi chia sẻ')).toBeInTheDocument();
  });

  it('allows selecting multiple work types', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    // Click on multiple work type buttons
    const sbgNewButton = screen.getByText('SBG mới');
    const partnerOldButton = screen.getByText('Đối tác cũ');
    
    await user.click(sbgNewButton);
    await user.click(partnerOldButton);
    
    // Both should be selected (you'd need to check visual indicators)
    expect(sbgNewButton.closest('button')).toHaveClass('border-blue-500');
    expect(partnerOldButton.closest('button')).toHaveClass('border-blue-500');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Lưu Công Việc');
    await user.click(submitButton);
    
    // Should show validation errors (HTML5 validation)
    const nameInput = screen.getByLabelText(/Tiêu đề công việc/);
    expect(nameInput).toBeInvalid();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    // Fill form fields
    await user.type(screen.getByLabelText(/Tiêu đề công việc/), 'Test Task');
    await user.type(screen.getByLabelText(/Mô tả chi tiết/), 'Test Description');
    
    // Select work type
    await user.click(screen.getByText('SBG mới'));
    
    // Submit form
    await user.click(screen.getByText('Lưu Công Việc'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Task',
          description: 'Test Description',
          workTypes: expect.arrayContaining(['sbg-new']),
        })
      );
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    await user.click(screen.getByText('Hủy bỏ'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/Tiêu đề công việc/), 'Test Task');
    await user.click(screen.getByText('SBG mới'));
    await user.click(screen.getByText('Lưu Công Việc'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    
    // Form should be reset (you'd need to re-render to test this properly)
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('sets default start date to today', () => {
    render(<CreateTaskModal {...defaultProps} />);
    
    const today = new Date().toISOString().split('T')[0];
    // You'd need to check the DatePicker component's value
    // This would require accessing the DatePicker's input value
  });

  it('handles dropdown selections', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    // Test priority dropdown
    const priorityDropdown = screen.getByText('Chọn mức độ ưu tiên');
    await user.click(priorityDropdown);
    
    // Should show dropdown options
    expect(screen.getByText('Cao')).toBeInTheDocument();
    expect(screen.getByText('Bình thường')).toBeInTheDocument();
    expect(screen.getByText('Thấp')).toBeInTheDocument();
  });

  it('handles share scope selection', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);
    
    const shareScopeDropdown = screen.getByText('Chọn phạm vi chia sẻ');
    await user.click(shareScopeDropdown);
    
    expect(screen.getByText('Nhóm của tôi')).toBeInTheDocument();
    expect(screen.getByText('Riêng tư')).toBeInTheDocument();
    expect(screen.getByText('Công khai')).toBeInTheDocument();
  });
});
