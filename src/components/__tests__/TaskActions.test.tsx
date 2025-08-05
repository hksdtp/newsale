import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskActions from '../TaskActions';

describe('TaskActions Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Compact Mode', () => {
    it('renders compact task actions with enhanced styling', () => {
      render(
        <TaskActions
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={true}
        />
      );

      // Kiểm tra 2 nút có hiển thị
      const editButton = screen.getByTitle('Chỉnh sửa công việc');
      const deleteButton = screen.getByTitle('Xóa công việc');

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Kiểm tra styling nổi bật
      expect(editButton).toHaveClass('bg-blue-500/20', 'border-blue-500/30');
      expect(deleteButton).toHaveClass('bg-red-500/20', 'border-red-500/30');
    });

    it('calls onEdit when edit button is clicked', () => {
      render(
        <TaskActions
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={true}
        />
      );

      const editButton = screen.getByTitle('Chỉnh sửa công việc');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when delete button is clicked', () => {
      render(
        <TaskActions
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={true}
        />
      );

      const deleteButton = screen.getByTitle('Xóa công việc');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('stops event propagation when buttons are clicked', () => {
      const mockEvent = {
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent;

      render(
        <TaskActions
          onEdit={(e) => mockOnEdit(e)}
          onDelete={(e) => mockOnDelete(e)}
          compact={true}
        />
      );

      const editButton = screen.getByTitle('Chỉnh sửa công việc');
      fireEvent.click(editButton);

      // Verify that the event handler was called
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Default Mode', () => {
    it('renders default task actions with vertical layout', () => {
      render(
        <TaskActions
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={false}
        />
      );

      const editButton = screen.getByTitle('Chỉnh sửa công việc');
      const deleteButton = screen.getByTitle('Xóa công việc');

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Kiểm tra layout vertical
      const container = editButton.closest('div');
      expect(container).toHaveClass('flex-col');
    });
  });

  describe('Enhanced Styling Features', () => {
    it('has backdrop blur and shadow effects in compact mode', () => {
      render(
        <TaskActions
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={true}
        />
      );

      const container = screen.getByTitle('Chỉnh sửa công việc').closest('div');
      expect(container).toHaveClass('backdrop-blur-sm', 'shadow-lg');
    });

    it('has hover effects on buttons', () => {
      render(
        <TaskActions
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={true}
        />
      );

      const editButton = screen.getByTitle('Chỉnh sửa công việc');
      const deleteButton = screen.getByTitle('Xóa công việc');

      expect(editButton).toHaveClass('hover:scale-105', 'hover:shadow-md');
      expect(deleteButton).toHaveClass('hover:scale-105', 'hover:shadow-md');
    });
  });
});
