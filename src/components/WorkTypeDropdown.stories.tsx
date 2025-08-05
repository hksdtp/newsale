import type { Meta, StoryObj } from '@storybook/react';
const fn = (name?: string) => (...args: any[]) => console.log(name || 'action', args);
import WorkTypeDropdown from './WorkTypeDropdown';

const meta: Meta<typeof WorkTypeDropdown> = {
  title: 'Components/WorkTypeDropdown',
  component: WorkTypeDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern, searchable dropdown for selecting multiple work types. Features categorized options, search functionality, and beautiful visual design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'Array of selected work type values',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when selection changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no options are selected',
    },
    label: {
      control: 'text',
      description: 'Label for the dropdown',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the dropdown is disabled',
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
    value: [],
    placeholder: 'Chọn loại công việc',
  },
};

export const WithLabel: Story = {
  args: {
    value: [],
    label: 'Loại công việc',
    placeholder: 'Chọn loại công việc',
  },
};

export const Required: Story = {
  args: {
    value: [],
    label: 'Loại công việc',
    placeholder: 'Chọn loại công việc',
    required: true,
  },
};

export const WithSingleSelection: Story = {
  args: {
    value: ['sbg-new'],
    label: 'Loại công việc',
    placeholder: 'Chọn loại công việc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with a single work type selected.',
      },
    },
  },
};

export const WithMultipleSelections: Story = {
  args: {
    value: ['sbg-new', 'partner-old', 'customer-new'],
    label: 'Loại công việc',
    placeholder: 'Chọn loại công việc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with multiple work types selected, showing how badges wrap and display.',
      },
    },
  },
};

export const AllCategoriesSelected: Story = {
  args: {
    value: ['sbg-new', 'sbg-old', 'partner-new', 'partner-old', 'kts-new', 'kts-old', 'customer-new', 'customer-old', 'other'],
    label: 'Loại công việc',
    placeholder: 'Chọn loại công việc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with all work types selected to test layout with many selections.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: ['sbg-new', 'partner-old'],
    label: 'Loại công việc',
    placeholder: 'Chọn loại công việc',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled dropdown showing how it appears when not interactive.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    value: [],
    label: 'Loại công việc dự án',
    placeholder: 'Chọn một hoặc nhiều loại công việc',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive dropdown. Click to open and try the search functionality, category organization, and selection features.',
      },
    },
  },
};

export const InForm: Story = {
  render: () => (
    <div className="space-y-4 p-6 bg-gray-900 rounded-lg min-w-[400px]">
      <h3 className="text-lg font-semibold text-white mb-4">Tạo công việc mới</h3>
      
      <div>
        <label className="block text-white font-medium mb-2">
          Tên công việc <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Nhập tên công việc"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <WorkTypeDropdown
        label="Loại công việc"
        value={['sbg-new']}
        onChange={fn()}
        placeholder="Chọn loại công việc"
        required
      />

      <div>
        <label className="block text-white font-medium mb-2">
          Mô tả
        </label>
        <textarea
          placeholder="Mô tả chi tiết công việc"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Tạo công việc
        </button>
        <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
          Hủy bỏ
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing the WorkTypeDropdown integrated into a form context.',
      },
    },
  },
};

export const SearchFunctionality: Story = {
  args: {
    value: [],
    label: 'Tìm kiếm loại công việc',
    placeholder: 'Chọn loại công việc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Click to open and try typing in the search box to filter work types. Try searching for "SBG", "đối tác", or "mới".',
      },
    },
  },
};

export const CategoryOrganization: Story = {
  args: {
    value: ['sbg-new', 'partner-new'],
    label: 'Loại công việc theo danh mục',
    placeholder: 'Chọn loại công việc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Open the dropdown to see how work types are organized by categories: SBG, Đối tác, KTS, Khách hàng, and Khác.',
      },
    },
  },
};
