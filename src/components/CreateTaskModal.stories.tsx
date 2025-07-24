import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import CreateTaskModal from './CreateTaskModal';

const meta: Meta<typeof CreateTaskModal> = {
  title: 'Components/CreateTaskModal',
  component: CreateTaskModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive modal for creating new tasks with work type selection, date pickers, dropdowns, and form validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    onClose: {
      action: 'closed',
      description: 'Callback fired when modal is closed',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback fired when form is submitted',
    },
  },
  args: {
    onClose: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state. Nothing should be visible.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive modal. Try selecting work types, filling the form, and using the date picker and dropdowns.',
      },
    },
  },
};

export const FormValidation: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Try submitting the form without filling required fields to see validation in action.',
      },
    },
  },
};

export const WorkTypeSelection: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus on work type selection. You can select multiple work types and see the visual feedback.',
      },
    },
  },
};

export const DatePickerDemo: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus on the date picker functionality. Try the "Hôm nay" and "Ngày mai" quick actions.',
      },
    },
  },
};

export const DropdownDemo: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus on dropdown functionality. Test the status, priority, and share scope dropdowns.',
      },
    },
  },
};
