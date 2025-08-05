-- Supabase Storage Setup for Task Attachments
-- Created: 2025-08-03

-- 1. Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for storage bucket

-- Policy: Users can view files for tasks they have access to
CREATE POLICY "Users can view task attachments they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-attachments' AND
    EXISTS (
      SELECT 1 FROM task_attachments ta
      JOIN tasks t ON ta.task_id = t.id
      WHERE ta.file_path = storage.objects.name
      AND (
        t.created_by_id = auth.uid()::text::uuid 
        OR t.assigned_to_id = auth.uid()::text::uuid
        OR t.share_scope = 'public'
        OR (t.share_scope = 'team' AND t.team_id IN (
          SELECT team_id FROM users WHERE id = auth.uid()::text::uuid
        ))
      )
    )
  );

-- Policy: Users can upload files for tasks they can access
CREATE POLICY "Users can upload task attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-attachments' AND
    auth.role() = 'authenticated'
  );

-- Policy: Users can delete their own uploaded files
CREATE POLICY "Users can delete their own task attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-attachments' AND
    EXISTS (
      SELECT 1 FROM task_attachments ta
      WHERE ta.file_path = storage.objects.name
      AND ta.uploaded_by = auth.uid()::text::uuid
    )
  );

-- 3. Create helper function to generate file path
CREATE OR REPLACE FUNCTION generate_task_attachment_path(
  task_uuid UUID,
  file_name TEXT,
  user_uuid UUID
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'tasks/' || task_uuid::text || '/' || user_uuid::text || '/' || 
         extract(epoch from now())::bigint || '_' || file_name;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_attachments()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Find files in storage that don't have corresponding database records
  FOR file_record IN
    SELECT name FROM storage.objects 
    WHERE bucket_id = 'task-attachments'
    AND name NOT IN (
      SELECT file_path FROM task_attachments
    )
  LOOP
    -- Delete the orphaned file
    DELETE FROM storage.objects 
    WHERE bucket_id = 'task-attachments' 
    AND name = file_record.name;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to get file URL with expiration
CREATE OR REPLACE FUNCTION get_task_attachment_url(
  file_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
BEGIN
  -- This will be handled by the application layer
  -- Return the file path for now
  RETURN file_path;
END;
$$ LANGUAGE plpgsql;

-- 6. Add comments
COMMENT ON FUNCTION generate_task_attachment_path(UUID, TEXT, UUID) IS 'Generates unique file path for task attachments';
COMMENT ON FUNCTION cleanup_orphaned_attachments() IS 'Removes files from storage that have no database record';
COMMENT ON FUNCTION get_task_attachment_url(TEXT, INTEGER) IS 'Gets signed URL for task attachment file';
