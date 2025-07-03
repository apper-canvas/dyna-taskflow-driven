import { useState, useEffect } from 'react';
import TaskList from '@/components/organisms/TaskList';
import TaskModal from '@/components/organisms/TaskModal';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { projectService } from '@/services/api/projectService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      
      // Map tasks with their project information
      const tasksWithProjects = tasksData.map(task => ({
        ...task,
        project: projectsData.find(p => p.Id === task.projectId)
      }));
      
      setTasks(tasksWithProjects);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await taskService.update(taskId, { completed });
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, completed } : task
      ));
    } catch (err) {
      throw new Error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
    } catch (err) {
      throw new Error('Failed to delete task');
    }
  };

  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    loadData(); // Refresh data after modal closes
};

  const handleBulkComplete = async (taskIds) => {
    try {
      await taskService.bulkComplete(taskIds);
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.Id) ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
      ));
    } catch (err) {
      throw new Error('Failed to complete tasks');
    }
  };

  const handleBulkDelete = async (taskIds) => {
    try {
      await taskService.bulkDelete(taskIds);
      setTasks(prev => prev.filter(task => !taskIds.includes(task.Id)));
    } catch (err) {
      throw new Error('Failed to delete tasks');
    }
  };

  const handleBulkMove = async (taskIds, projectId) => {
    try {
      await taskService.bulkMove(taskIds, projectId);
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.Id) 
          ? { ...task, projectId, project: projects.find(p => p.Id === projectId) }
          : task
      ));
    } catch (err) {
      throw new Error('Failed to move tasks');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and organize your tasks</p>
        </div>
        <Button variant="primary" onClick={handleCreateTask}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Task
        </Button>
      </div>

<TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onRetry={loadData}
        onToggleComplete={handleToggleComplete}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onBulkComplete={handleBulkComplete}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleBulkMove}
        projects={projects}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleModalClose}
        task={editingTask}
      />
    </div>
  );
};

export default Tasks;