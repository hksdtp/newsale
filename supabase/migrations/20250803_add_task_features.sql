-- Migration: Add Task Features (Attachments, Checklist, Scheduling)
-- Created: 2025-08-03

-- 1. Add scheduling columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'scheduled', 'recurring'));

-- 2. Create task_attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create task_checklist_items table
CREATE TABLE IF NOT EXISTS task_checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_task_checklist_items_task_id ON task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_task_checklist_items_order ON task_checklist_items(task_id, order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source);

-- 5. Enable RLS (Row Level Security) for new tables
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for task_attachments
CREATE POLICY "Users can view attachments for tasks they can access" ON task_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_attachments.task_id
      AND (
        tasks.created_by_id = auth.uid()::text::uuid 
        OR tasks.assigned_to_id = auth.uid()::text::uuid
        OR tasks.share_scope = 'public'
        OR (tasks.share_scope = 'team' AND tasks.team_id IN (
          SELECT team_id FROM users WHERE id = auth.uid()::text::uuid
        ))
      )
    )
  );

CREATE POLICY "Users can insert attachments for tasks they can access" ON task_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_attachments.task_id
      AND (
        tasks.created_by_id = auth.uid()::text::uuid 
        OR tasks.assigned_to_id = auth.uid()::text::uuid
      )
    )
  );

CREATE POLICY "Users can delete their own attachments" ON task_attachments
  FOR DELETE USING (uploaded_by = auth.uid()::text::uuid);

-- 7. Create RLS policies for task_checklist_items
CREATE POLICY "Users can view checklist items for tasks they can access" ON task_checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_checklist_items.task_id
      AND (
        tasks.created_by_id = auth.uid()::text::uuid 
        OR tasks.assigned_to_id = auth.uid()::text::uuid
        OR tasks.share_scope = 'public'
        OR (tasks.share_scope = 'team' AND tasks.team_id IN (
          SELECT team_id FROM users WHERE id = auth.uid()::text::uuid
        ))
      )
    )
  );

CREATE POLICY "Users can manage checklist items for tasks they can access" ON task_checklist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_checklist_items.task_id
      AND (
        tasks.created_by_id = auth.uid()::text::uuid 
        OR tasks.assigned_to_id = auth.uid()::text::uuid
      )
    )
  );

-- 8. Add triggers for updated_at columns
CREATE TRIGGER update_task_attachments_updated_at
  BEFORE UPDATE ON task_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_checklist_items_updated_at
  BEFORE UPDATE ON task_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function to calculate checklist progress
CREATE OR REPLACE FUNCTION get_task_checklist_progress(task_uuid UUID)
RETURNS JSON AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  progress_percentage INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items
  FROM task_checklist_items
  WHERE task_id = task_uuid;
  
  SELECT COUNT(*) INTO completed_items
  FROM task_checklist_items
  WHERE task_id = task_uuid AND is_completed = TRUE;
  
  IF total_items = 0 THEN
    progress_percentage := 0;
  ELSE
    progress_percentage := ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100);
  END IF;
  
  RETURN json_build_object(
    'total', total_items,
    'completed', completed_items,
    'percentage', progress_percentage
  );
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to move scheduled tasks to current day
CREATE OR REPLACE FUNCTION move_scheduled_tasks_to_today()
RETURNS INTEGER AS $$
DECLARE
  moved_count INTEGER := 0;
BEGIN
  UPDATE tasks 
  SET 
    source = 'scheduled',
    updated_at = NOW()
  WHERE 
    scheduled_date::DATE = CURRENT_DATE
    AND source = 'manual'
    AND scheduled_date IS NOT NULL;
    
  GET DIAGNOSTICS moved_count = ROW_COUNT;
  
  RETURN moved_count;
END;
$$ LANGUAGE plpgsql;

-- 11. Add comments for documentation
COMMENT ON TABLE task_attachments IS 'Stores file attachments for tasks';
COMMENT ON TABLE task_checklist_items IS 'Stores checklist items for tasks';
COMMENT ON COLUMN tasks.scheduled_date IS 'Date and time when task should be automatically moved to active';
COMMENT ON COLUMN tasks.scheduled_time IS 'Specific time for scheduled task';
COMMENT ON COLUMN tasks.source IS 'Source of task: manual, scheduled, or recurring';
COMMENT ON FUNCTION get_task_checklist_progress(UUID) IS 'Returns checklist progress for a task';
COMMENT ON FUNCTION move_scheduled_tasks_to_today() IS 'Moves scheduled tasks to current day';
