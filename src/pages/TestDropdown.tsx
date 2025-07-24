import React, { useState } from 'react';
import WorkTypeDropdown from '../components/WorkTypeDropdown';
import WorkTypeDropdownDemo from '../components/WorkTypeDropdownDemo';

const TestDropdown: React.FC = () => {
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">WorkType Dropdown - Tối Ưu Mobile</h1>

        <div className="space-y-8 mb-8">
          {/* Demo Component */}
          <WorkTypeDropdownDemo />

          {/* Mobile Responsive Info */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">📱 Mobile Responsive Design</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-medium text-white">Mobile</div>
                <div className="text-xs text-gray-400">Dưới 640px</div>
                <div className="text-xs text-green-400">2 cột grid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📟</div>
                <div className="text-sm font-medium text-white">Tablet</div>
                <div className="text-xs text-gray-400">640px - 1024px</div>
                <div className="text-xs text-green-400">3 cột grid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💻</div>
                <div className="text-sm font-medium text-white">Desktop</div>
                <div className="text-xs text-gray-400">Trên 1024px</div>
                <div className="text-xs text-green-400">4 cột grid</div>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              Sử dụng Developer Tools (F12) → Device Toolbar (Ctrl+Shift+M) để test responsive design
            </p>
          </div>

          {/* Original Test */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Test Thủ Công</h3>
            <WorkTypeDropdown
              label="Loại công việc"
              value={selectedWorkTypes}
              onChange={setSelectedWorkTypes}
              placeholder="Chọn loại công việc"
              required
            />

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Values:</h4>
              <pre className="bg-gray-700 p-3 rounded text-green-400 text-xs overflow-x-auto">
                {JSON.stringify(selectedWorkTypes, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Test scroll locking and dropdown height */}
        <div className="mt-8 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🧪 Hướng Dẫn Test</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-3">Test 1: Khóa Cuộn Trang</h3>
                <ol className="text-gray-300 space-y-2 text-sm">
                  <li>1. Cuộn trang xuống một chút</li>
                  <li>2. Mở dropdown loại công việc</li>
                  <li>3. Thử cuộn bằng:</li>
                  <li className="ml-4">• Scroll wheel chuột</li>
                  <li className="ml-4">• Phím mũi tên ↑↓</li>
                  <li className="ml-4">• Page Up/Down</li>
                  <li className="ml-4">• Spacebar</li>
                  <li>4. ✅ Trang không được cuộn</li>
                  <li>5. Đóng dropdown</li>
                  <li>6. ✅ Cuộn hoạt động bình thường</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium text-green-400 mb-3">Test 2: Badge Design & Mobile</h3>
                <ol className="text-gray-300 space-y-2 text-sm">
                  <li>1. Mở dropdown loại công việc</li>
                  <li>2. ✅ Badge/tag design đơn giản</li>
                  <li>3. ✅ Responsive grid:</li>
                  <li className="ml-4">• Mobile: 2-3 cột</li>
                  <li className="ml-4">• Desktop: 4 cột</li>
                  <li>4. ✅ Touch-friendly (min 44px)</li>
                  <li>5. ✅ Selected badges truncation</li>
                  <li>6. ✅ Smooth animations</li>
                  <li>7. ✅ Mobile height: 90vh</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Nội Dung Test Cuộn Trang</h3>
            <p className="text-gray-400">
              Sử dụng nội dung dưới đây để test tính năng khóa cuộn trang:
            </p>
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className="bg-gray-700 p-4 rounded text-white">
                <div className="flex items-center justify-between">
                  <span>📄 Nội dung test scroll #{i + 1}</span>
                  <span className="text-gray-400 text-sm">Line {i + 1}/25</span>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDropdown;
