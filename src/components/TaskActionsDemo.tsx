import React from 'react';
import TaskActions from './TaskActions';

const TaskActionsDemo: React.FC = () => {
  const handleEdit = (e?: React.MouseEvent) => {
    console.log('Edit clicked!', e);
    alert('Nút Sửa đã được click!');
  };

  const handleDelete = (e?: React.MouseEvent) => {
    console.log('Delete clicked!', e);
    alert('Nút Xóa đã được click!');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">TaskActions Demo</h1>
        
        {/* Demo trong context giống TaskList */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Compact Mode (như trong TaskList)</h2>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 <strong>Hướng dẫn:</strong><br/>
              • <strong>Desktop:</strong> Di chuyển chuột vào task để thấy 2 nút Sửa/Xóa xuất hiện<br/>
              • <strong>Mobile/Tablet:</strong> Tap vào task để mở chi tiết, 2 nút Sửa/Xóa có trong modal (tiết kiệm không gian)
            </p>
          </div>
          
          {/* Giả lập task item */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-3 sm:px-4 lg:px-6 py-3 hover:bg-gray-700/30 transition-all duration-200 cursor-pointer relative border-b border-gray-700/50">
              
              {/* Fake task content */}
              <div className="flex-1 min-w-0">
                <div className="hidden md:flex items-center w-full">
                  <span className="text-gray-200 text-sm font-medium min-w-0 flex-shrink-0" style={{width: '180px'}}>
                    Nguyễn Văn A
                  </span>
                  <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors text-sm min-w-0 flex-1 ml-8">
                    Tạo campaign Facebook cho sản phẩm mới
                    <span className="text-gray-300 font-normal">
                      {' - '}Thiết kế creative và setup targeting cho chiến dịch quảng cáo
                    </span>
                  </h5>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden w-full space-y-1">
                  <div className="flex items-center w-full">
                    <span className="text-gray-200 text-base font-medium truncate">
                      Nguyễn Văn A
                    </span>
                    <div className="flex-1"></div>
                    <span className="text-xs text-gray-400 font-medium" style={{marginLeft: 'auto', paddingLeft: '16px'}}>
                      Hôm nay
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm leading-tight">
                    Tạo campaign Facebook cho sản phẩm mới
                  </h5>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Thiết kế creative và setup targeting cho chiến dịch quảng cáo
                  </p>

                  {/* Mobile: Ẩn action buttons để tiết kiệm không gian - dùng TaskDetailModal thay thế */}
                </div>
              </div>

              {/* Date */}
              <div className="hidden md:block flex-shrink-0 text-xs text-gray-400 font-medium min-w-0" style={{width: '60px', textAlign: 'right'}}>
                Hôm nay
              </div>

              {/* Desktop Actions - Chỉ hiển thị khi hover */}
              <div className="hidden md:flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 top-1/2 -translate-y-1/2">
                <TaskActions
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  compact
                />
              </div>
            </div>
          </div>

          {/* Demo standalone */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Standalone Modes</h2>
            
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Compact Mode</h3>
                <TaskActions
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  compact
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Default Mode</h3>
                <TaskActions
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  compact={false}
                />
              </div>
            </div>
          </div>

          {/* Mobile/Tablet UX Demo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Mobile/Tablet UX - Space Optimized</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Tiết Kiệm Không Gian</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Ẩn 2 nút Sửa/Xóa</strong> - Tiết kiệm không gian màn hình</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Tap để mở chi tiết</strong> - Toàn bộ task area có thể tap</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Actions trong modal</strong> - 2 nút Sửa/Xóa có trong TaskDetailModal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Clean interface</strong> - Giao diện gọn gàng, tập trung vào nội dung</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test different backgrounds */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Background Tests</h2>
            
            <div className="bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-white mb-2">On Blue Background</h3>
              <TaskActions onEdit={handleEdit} onDelete={handleDelete} compact />
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-white mb-2">On Dark Gray Background</h3>
              <TaskActions onEdit={handleEdit} onDelete={handleDelete} compact />
            </div>

            <div className="bg-gray-600 rounded-lg p-6">
              <h3 className="text-white mb-2">On Light Gray Background</h3>
              <TaskActions onEdit={handleEdit} onDelete={handleDelete} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskActionsDemo;
