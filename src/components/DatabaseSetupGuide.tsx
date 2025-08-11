import React, { useState } from 'react';
import { supabase } from '../shared/api/supabase';

interface DatabaseSetupGuideProps {
  onSetupComplete?: () => void;
}

export const DatabaseSetupGuide: React.FC<DatabaseSetupGuideProps> = ({ onSetupComplete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAutoSetup = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      // Thử tạo NHÓM 5 tự động
      console.log('🚀 Bắt đầu tạo NHÓM 5...');

      // 1. Tạo team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .upsert(
          [
            {
              name: 'NHÓM 5 - Mai Tiến Đạt',
              description: 'Nhóm kinh doanh Hà Nội 5',
            },
          ],
          { onConflict: 'name' }
        )
        .select()
        .single();

      if (teamError) {
        throw new Error(`Lỗi tạo team: ${teamError.message}`);
      }

      // 2. Tạo user
      const { data: user, error: userError } = await supabase
        .from('users')
        .upsert(
          [
            {
              name: 'Mai Tiến Đạt',
              email: 'dat.mai@company.com',
              password: '123456',
              password_changed: false,
              team_id: team.id,
              location: 'Hà Nội',
              role: 'team_leader',
              department_type: 'Kinh doanh',
            },
          ],
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (userError) {
        throw new Error(`Lỗi tạo user: ${userError.message}`);
      }

      setResult(`✅ Thành công! Đã tạo ${team.name} với trưởng nhóm ${user.name}`);

      // Gọi callback để refresh data
      if (onSetupComplete) {
        setTimeout(onSetupComplete, 1000);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult(`❌ Lỗi: ${(error as Error).message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const sqlScript = `-- Script tạo NHÓM 5 và Mai Tiến Đạt
-- Copy và paste vào Supabase SQL Editor

-- 1. Tạo NHÓM 5
INSERT INTO teams (name, description, created_at, updated_at)
VALUES (
  'NHÓM 5 - Mai Tiến Đạt',
  'Nhóm kinh doanh Hà Nội 5',
  NOW(),
  NOW()
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Thêm Mai Tiến Đạt làm trưởng nhóm
INSERT INTO users (
  name, email, password, password_changed,
  team_id, location, role, department_type,
  created_at, updated_at
) VALUES (
  'Mai Tiến Đạt',
  'dat.mai@company.com',
  '123456',
  false,
  (SELECT id FROM teams WHERE name = 'NHÓM 5 - Mai Tiến Đạt' LIMIT 1),
  'Hà Nội',
  'team_leader',
  'Kinh doanh',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  team_id = EXCLUDED.team_id,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 3. Kiểm tra kết quả
SELECT t.name as team_name, u.name as leader_name, u.role
FROM teams t
LEFT JOIN users u ON t.id = u.team_id
WHERE t.name = 'NHÓM 5 - Mai Tiến Đạt';`;

  return (
    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            Thiết lập NHÓM 5 - Mai Tiến Đạt
          </h3>
          <p className="text-yellow-200 mb-4">
            NHÓM 5 chưa được tạo trong database. Bạn có thể tạo tự động hoặc thủ công.
          </p>

          {/* Auto Setup Button */}
          <div className="mb-6">
            <button
              onClick={handleAutoSetup}
              disabled={isCreating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Tạo tự động</span>
                </>
              )}
            </button>

            {result && (
              <div
                className={`mt-3 p-3 rounded-lg ${
                  result.includes('✅')
                    ? 'bg-green-900/20 border border-green-600 text-green-200'
                    : 'bg-red-900/20 border border-red-600 text-red-200'
                }`}
              >
                {result}
              </div>
            )}
          </div>

          {/* Manual Setup Instructions */}
          <div className="border-t border-yellow-600 pt-4">
            <h4 className="font-semibold text-yellow-300 mb-3">Hoặc tạo thủ công:</h4>

            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-yellow-200 mb-2">📌 Cách 1: Supabase Dashboard</h5>
                <ol className="list-decimal list-inside text-sm text-yellow-100 space-y-1 ml-4">
                  <li>Truy cập Supabase Dashboard của dự án</li>
                  <li>Vào SQL Editor</li>
                  <li>Copy script SQL bên dưới và chạy</li>
                  <li>Refresh trang này để thấy NHÓM 5</li>
                </ol>
              </div>

              <div>
                <h5 className="font-medium text-yellow-200 mb-2">📌 Cách 2: Local Database</h5>
                <ol className="list-decimal list-inside text-sm text-yellow-100 space-y-1 ml-4">
                  <li>Khởi động Docker Desktop</li>
                  <li>
                    Chạy: <code className="bg-gray-800 px-2 py-1 rounded">npm run db:start</code>
                  </li>
                  <li>
                    Chạy:{' '}
                    <code className="bg-gray-800 px-2 py-1 rounded">
                      node scripts/auto-create-team5.js
                    </code>
                  </li>
                </ol>
              </div>

              {/* SQL Script */}
              <div>
                <h5 className="font-medium text-yellow-200 mb-2">📝 Script SQL:</h5>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">{sqlScript}</pre>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(sqlScript)}
                  className="mt-2 text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  📋 Copy SQL
                </button>
              </div>
            </div>
          </div>

          {/* Expected Result */}
          <div className="border-t border-yellow-600 pt-4 mt-4">
            <h4 className="font-semibold text-yellow-300 mb-2">🎯 Kết quả mong đợi:</h4>
            <div className="text-sm text-yellow-100 space-y-1">
              <p>
                • <strong>NHÓM 5 - Mai Tiến Đạt</strong> sẽ xuất hiện trong danh sách nhóm
              </p>
              <p>• Mai Tiến Đạt có thể đăng nhập với:</p>
              <div className="ml-4 bg-gray-800 p-2 rounded text-gray-300">
                <p>Email: dat.mai@company.com</p>
                <p>Mật khẩu: 123456</p>
              </div>
              <p>• Bạn có thể quản lý nhân viên qua tab &quot;Quản lý&quot;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
