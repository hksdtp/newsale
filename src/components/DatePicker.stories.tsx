import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import DatePicker from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A beautiful date picker component with macOS/iPhone-like design. Features calendar navigation, quick actions, and Vietnamese localization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'The selected date in YYYY-MM-DD format',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when date is selected',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no date is selected',
    },
    label: {
      control: 'text',
      description: 'Label for the date picker',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    minDate: {
      control: 'text',
      description: 'Minimum selectable date in YYYY-MM-DD format',
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Chọn ngày',
  },
};

export const WithValue: Story = {
  args: {
    value: '2025-01-15',
    placeholder: 'Chọn ngày',
  },
};

export const WithLabel: Story = {
  args: {
    value: '',
    label: 'Ngày thực hiện',
    placeholder: 'Chọn ngày thực hiện',
  },
};

export const Required: Story = {
  args: {
    value: '',
    label: 'Ngày thực hiện',
    placeholder: 'Chọn ngày thực hiện',
    required: true,
  },
};

export const WithMinDate: Story = {
  args: {
    value: '',
    label: 'Hạn chót',
    placeholder: 'Chọn hạn chót',
    minDate: new Date().toISOString().split('T')[0],
  },
  parameters: {
    docs: {
      description: {
        story: 'Date picker with minimum date constraint. Dates before today are disabled.',
      },
    },
  },
};

export const StartAndDueDates: Story = {
  render: () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return (
      <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
        <DatePicker
          label="Ngày thực hiện"
          value={today}
          onChange={fn()}
          placeholder="Chọn ngày thực hiện"
          required
        />
        <DatePicker
          label="Hạn chót"
          value={nextWeek}
          onChange={fn()}
          placeholder="Chọn hạn chót"
          minDate={today}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing start date and due date pickers working together.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    value: '',
    label: 'Ngày sinh nhật',
    placeholder: 'Chọn ngày sinh nhật của bạn',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive date picker. Click to open calendar and try the quick action buttons.',
      },
    },
  },
};
