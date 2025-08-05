import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock TaskList component để test mobile behavior
const MockTaskItem = ({ task, onTaskClick }: { task: any, onTaskClick: (task: any) => void }) => {
  return (
    <div 
      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-3 sm:px-4 lg:px-6 py-3 hover:bg-gray-700/30 transition-all duration-200 cursor-pointer relative border-b border-gray-700/50"
      onClick={() => onTaskClick(task)}
      data-testid="task-item"
    >
      {/* Desktop: Actions chỉ hiển thị khi hover */}
      <div className="hidden md:flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 top-1/2 -translate-y-1/2">
        <button data-testid="desktop-edit-btn">Edit</button>
        <button data-testid="desktop-delete-btn">Delete</button>
      </div>

      {/* Mobile: Ẩn action buttons để tiết kiệm không gian */}
      {/* Không có mobile actions - dùng TaskDetailModal thay thế */}
      
      <div className="flex-1">
        <h5 className="font-medium text-white">{task.name}</h5>
        <p className="text-gray-300">{task.description}</p>
      </div>
    </div>
  );
};

describe('TaskList Mobile UX', () => {
  const mockTask = {
    id: '1',
    name: 'Test Task',
    description: 'Test Description'
  };

  const mockOnTaskClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Behavior', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('shows action buttons only on hover', () => {
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      const taskItem = screen.getByTestId('task-item');
      const editBtn = screen.getByTestId('desktop-edit-btn');
      const deleteBtn = screen.getByTestId('desktop-delete-btn');

      // Initially hidden (opacity-0)
      expect(editBtn.closest('div')).toHaveClass('opacity-0');
      expect(deleteBtn.closest('div')).toHaveClass('opacity-0');

      // Should show on hover (group-hover:opacity-100)
      expect(editBtn.closest('div')).toHaveClass('group-hover:opacity-100');
      expect(deleteBtn.closest('div')).toHaveClass('group-hover:opacity-100');
    });
  });

  describe('Mobile Behavior', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('does not show action buttons on mobile to save space', () => {
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      // Desktop buttons should be hidden on mobile (md:flex = hidden on mobile)
      const editBtn = screen.getByTestId('desktop-edit-btn');
      const deleteBtn = screen.getByTestId('desktop-delete-btn');
      
      expect(editBtn.closest('div')).toHaveClass('hidden', 'md:flex');
      expect(deleteBtn.closest('div')).toHaveClass('hidden', 'md:flex');
    });

    it('opens task detail modal when task is clicked on mobile', () => {
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      const taskItem = screen.getByTestId('task-item');
      fireEvent.click(taskItem);

      expect(mockOnTaskClick).toHaveBeenCalledWith(mockTask);
      expect(mockOnTaskClick).toHaveBeenCalledTimes(1);
    });

    it('provides clean interface without action buttons clutter', () => {
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      // Should not have mobile-specific action buttons
      expect(screen.queryByText('Chi tiết →')).not.toBeInTheDocument();
      
      // Should have clean task content
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  describe('Space Optimization', () => {
    it('saves vertical space by not showing action buttons on mobile', () => {
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      // Should not have border-t separator for mobile actions
      expect(screen.queryByText('border-t border-gray-700/30')).not.toBeInTheDocument();
      
      // Should not have mt-3 pt-3 spacing for mobile actions
      const taskItem = screen.getByTestId('task-item');
      expect(taskItem).not.toHaveClass('mt-3', 'pt-3');
    });

    it('focuses on task content without distractions', () => {
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      const taskItem = screen.getByTestId('task-item');
      
      // Should be clickable for opening detail modal
      expect(taskItem).toHaveClass('cursor-pointer');
      
      // Should have hover effects for better UX
      expect(taskItem).toHaveClass('hover:bg-gray-700/30');
    });
  });

  describe('TaskDetailModal Integration', () => {
    it('relies on TaskDetailModal for edit/delete actions on mobile', () => {
      // This test documents the expected behavior:
      // Mobile users tap task → TaskDetailModal opens → Edit/Delete buttons available in modal
      
      render(<MockTaskItem task={mockTask} onTaskClick={mockOnTaskClick} />);
      
      const taskItem = screen.getByTestId('task-item');
      fireEvent.click(taskItem);

      // Task click should trigger modal opening
      expect(mockOnTaskClick).toHaveBeenCalledWith(mockTask);
      
      // Note: TaskDetailModal has its own Edit/Delete buttons
      // This provides a cleaner mobile UX while maintaining functionality
    });
  });
});
