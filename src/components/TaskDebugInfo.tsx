import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../data/usersMockData';
import { taskService } from '../services/taskService';
import { supabase } from '../shared/api/supabase';

const TaskDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        setLoading(true);

        // Get current user
        const currentUser = getCurrentUser();

        // Get raw tasks from database
        const { data: rawTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        // Get all tasks through service
        const serviceTasks = await taskService.getTasks();

        // Get my tasks through service
        const myTasks = await taskService.getMyTasks(currentUser?.id);

        setDebugInfo({
          currentUser,
          rawTasksCount: rawTasks?.length || 0,
          rawTasks: rawTasks?.slice(0, 3) || [], // First 3 tasks
          serviceTasksCount: serviceTasks.length,
          myTasksCount: myTasks.length,
          tasksError,
          hasSupabaseConnection: !tasksError,
        });
      } catch (error) {
        console.error('Debug info error:', error);
        setDebugInfo({ error: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };

    loadDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        🔍 Loading debug info...
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      <h3 className="font-bold mb-2">🐛 Task Debug Info</h3>
      <div className="text-sm space-y-1">
        <div>
          <strong>Current User:</strong> {debugInfo.currentUser?.name || 'None'} (ID:{' '}
          {debugInfo.currentUser?.id || 'None'})
        </div>
        <div>
          <strong>Raw Tasks in DB:</strong> {debugInfo.rawTasksCount}
        </div>
        <div>
          <strong>Service Tasks:</strong> {debugInfo.serviceTasksCount}
        </div>
        <div>
          <strong>My Tasks:</strong> {debugInfo.myTasksCount}
        </div>
        <div>
          <strong>Supabase Connection:</strong> {debugInfo.hasSupabaseConnection ? '✅' : '❌'}
        </div>
        {debugInfo.tasksError && (
          <div>
            <strong>DB Error:</strong> {JSON.stringify(debugInfo.tasksError)}
          </div>
        )}
        {debugInfo.error && (
          <div>
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
        {debugInfo.rawTasks?.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Sample Raw Tasks</summary>
            <div className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-48">
              {debugInfo.rawTasks.map((task: any, index: number) => (
                <div key={index} className="mb-2 p-2 border border-gray-200 rounded">
                  <div>
                    <strong>Task {index + 1}:</strong> {task.name}
                  </div>
                  <div>
                    <strong>ID:</strong> {task.id}
                  </div>
                  <div>
                    <strong>Created By ID:</strong> {task.created_by_id}
                  </div>
                  <div>
                    <strong>Assigned To ID:</strong> {task.assigned_to_id}
                  </div>
                  <div>
                    <strong>Share Scope:</strong> {task.share_scope || 'null'}
                  </div>
                  <div>
                    <strong>Department:</strong> {task.department || 'null'}
                  </div>
                  <div>
                    <strong>Current User ID:</strong> {debugInfo.currentUser?.id}
                  </div>
                  <div>
                    <strong>Match Created:</strong>{' '}
                    {task.created_by_id === debugInfo.currentUser?.id ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Match Assigned:</strong>{' '}
                    {task.assigned_to_id === debugInfo.currentUser?.id ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default TaskDebugInfo;
