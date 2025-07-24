import React, { useState } from 'react';
import WorkTypeDropdown from './WorkTypeDropdown';
import { CheckCircle, Info } from 'lucide-react';

const WorkTypeDropdownDemo: React.FC = () => {
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(['sbg-new']);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Dropdown Loại Công Việc - Tối Ưu Mobile</h3>
          <p className="text-sm text-gray-400">Badge/Tag design với responsive layout</p>
        </div>
      </div>

      <div className="space-y-4">
        <WorkTypeDropdown
          label="Chọn loại công việc"
          value={selectedWorkTypes}
          onChange={setSelectedWorkTypes}
          placeholder="Chọn một hoặc nhiều loại công việc"
          required
        />

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-white">Tính năng tối ưu:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Badge/Tag design:</strong> Đơn giản, dễ nhận diện</li>
                <li>• <strong>Responsive grid:</strong> 2-3-4 cột tùy màn hình</li>
                <li>• <strong>Touch-friendly:</strong> Min 44px height cho mobile</li>
                <li>• <strong>Smart truncation:</strong> Hiển thị tối đa 3 badges + counter</li>
                <li>• <strong>Khóa cuộn mạnh mẽ:</strong> Prevent tất cả scroll events</li>
                <li>• <strong>Mobile optimized:</strong> 90vh height trên mobile</li>
              </ul>
            </div>
          </div>
        </div>

        {selectedWorkTypes.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-400 mb-2">Đã chọn ({selectedWorkTypes.length}):</h4>
            <div className="text-sm text-gray-300">
              <code className="bg-gray-700 px-2 py-1 rounded text-green-400">
                {JSON.stringify(selectedWorkTypes, null, 2)}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkTypeDropdownDemo;
