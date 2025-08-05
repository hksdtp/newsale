import React, { useState } from 'react';

function PlanningTab() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Task 1', completed: false },
    { id: 2, name: 'Task 2', completed: true },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium text-white mb-2">Danh sách Kế Hoạch Công Việc</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between p-4 mb-2 bg-gray-800 rounded-lg">
            <span className={task.completed ? "line-through text-gray-500" : "text-white"}>{task.name}</span>
            <button 
              onClick={() => toggleTaskCompletion(task.id)}
              className={task.completed ? "text-red-500" : "text-green-500"}
            >
              {task.completed ? "Undo" : "Complete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlanningTab;
