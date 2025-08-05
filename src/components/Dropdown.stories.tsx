import type { Meta, StoryObj } from '@storybook/react';
const fn = (name?: string) => (...args: any[]) => console.log(name || 'action', args);
import Dropdown from './Dropdown';
import { Clock, AlertTriangle, CheckCircle, Flag, User, Building } from 'lucide-react';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable dropdown component with support for icons, colors, and smooth animations. Perfect for status, priority, and category selections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'The selected option value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when option is selected',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    label: {
      control: 'text',
      description: 'Label for the dropdown',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const statusOptions = [
  { value: 'new-requests', label: 'Chưa tiến hành', color: 'bg-yellow-500', icon: Clock },
  { value: 'approved', label: 'Đang tiến hành', color: 'bg-blue-500', icon: AlertTriangle },
  { value: 'live', label: 'Đã hoàn thành', color: 'bg-green-500', icon: CheckCircle },
];

const priorityOptions = [
  { value: 'low', label: 'Thấp', color: 'bg-green-500' },
  { value: 'normal', label: 'Bình thường', color: 'bg-yellow-500' },
  { value: 'high', label: 'Cao', color: 'bg-red-500' },
];

const shareScopeOptions = [
  { value: 'team', label: 'Nhóm của tôi', icon: User },
  { value: 'private', label: 'Riêng tư', icon: User },
  { value: 'public', label: 'Công khai', icon: Building },
];

export const Default: Story = {
  args: {
    value: '',
    options: statusOptions,
    placeholder: 'Chọn trạng thái',
  },
};

export const WithValue: Story = {
  args: {
    value: 'approved',
    options: statusOptions,
    placeholder: 'Chọn trạng thái',
  },
};

export const WithLabel: Story = {
  args: {
    value: '',
    label: 'Trạng thái',
    options: statusOptions,
    placeholder: 'Chọn trạng thái',
  },
};

export const Required: Story = {
  args: {
    value: '',
    label: 'Trạng thái',
    options: statusOptions,
    placeholder: 'Chọn trạng thái',
    required: true,
  },
};

export const StatusDropdown: Story = {
  args: {
    value: 'new-requests',
    label: 'Trạng thái công việc',
    options: statusOptions,
    placeholder: 'Chọn trạng thái',
  },
  parameters: {
    docs: {
      description: {
        story: 'Status dropdown with icons and colors for different task states.',
      },
    },
  },
};

export const PriorityDropdown: Story = {
  args: {
    value: 'high',
    label: 'Mức độ ưu tiên',
    options: priorityOptions,
    placeholder: 'Chọn mức độ ưu tiên',
  },
  parameters: {
    docs: {
      description: {
        story: 'Priority dropdown with color-coded options.',
      },
    },
  },
};

export const ShareScopeDropdown: Story = {
  args: {
    value: 'team',
    label: 'Phạm vi chia sẻ',
    options: shareScopeOptions,
    placeholder: 'Chọn phạm vi chia sẻ',
  },
  parameters: {
    docs: {
      description: {
        story: 'Share scope dropdown with icons for different visibility levels.',
      },
    },
  },
};

export const AllDropdowns: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg min-w-[300px]">
      <Dropdown
        label="Trạng thái"
        value="approved"
        onChange={fn()}
        options={statusOptions}
        placeholder="Chọn trạng thái"
      />
      <Dropdown
        label="Mức độ ưu tiên"
        value="high"
        onChange={fn()}
        options={priorityOptions}
        placeholder="Chọn mức độ ưu tiên"
      />
      <Dropdown
        label="Phạm vi chia sẻ"
        value="team"
        onChange={fn()}
        options={shareScopeOptions}
        placeholder="Chọn phạm vi chia sẻ"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple dropdowns used together in a form.',
      },
    },
  },
};

export const LongOptions: Story = {
  args: {
    value: '',
    label: 'Loại công việc',
    options: [
      { value: 'option1', label: 'Phát triển tính năng mới cho hệ thống quản lý', color: 'bg-blue-500' },
      { value: 'option2', label: 'Bảo trì và cập nhật cơ sở dữ liệu', color: 'bg-green-500' },
      { value: 'option3', label: 'Nghiên cứu và phân tích yêu cầu khách hàng', color: 'bg-purple-500' },
      { value: 'option4', label: 'Kiểm thử và đảm bảo chất lượng sản phẩm', color: 'bg-orange-500' },
    ],
    placeholder: 'Chọn loại công việc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with longer option labels to test text wrapping and layout.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    value: '',
    label: 'Trạng thái dự án',
    options: statusOptions,
    placeholder: 'Chọn trạng thái dự án',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive dropdown. Click to open and select different options to see the animations.',
      },
    },
  },
};
