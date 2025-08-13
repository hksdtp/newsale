-- QUICK FIX: Cho phép tạo và cập nhật tasks

-- Drop các policy chặn
DROP POLICY IF EXISTS "Block writes" ON tasks;
DROP POLICY IF EXISTS "Block unauthorized writes" ON tasks;
DROP POLICY IF EXISTS "Restrict task creation" ON tasks;
DROP POLICY IF EXISTS "Restrict task updates" ON tasks;
DROP POLICY IF EXISTS "Restrict task deletions" ON tasks;

-- Tạo policies cho phép operations
CREATE POLICY "Allow task creation" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow task updates" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Allow task deletion" ON tasks
  FOR DELETE USING (true);
