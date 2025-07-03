import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isToday, isPast, parseISO } from 'date-fns';
import StatsCards from '@/components/organisms/StatsCards';
import TaskList from '@/components/organisms/TaskList';
import ProgressRing from '@/components/molecules/ProgressRing';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { projectService } from '@/services/api/projectService';
import CalendarWidget from '@/components/organisms/CalendarWidget';
const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completedToday = tasks.filter(task => 
      task.completed && task.completedAt && isToday(parseISO(task.completedAt))
    ).length;
    const overdue = tasks.filter(task => 
      !task.completed && task.deadline && isPast(parseISO(task.deadline)) && !isToday(parseISO(task.deadline))
    ).length;
    const dueToday = tasks.filter(task => 
      !task.completed && task.deadline && isToday(parseISO(task.deadline))
    ).length;

    return {
      totalTasks,
      completedTasks,
      completedToday,
      overdue,
      dueToday,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = getStats();
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your tasks.</p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Overview */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="text-center">
            <ProgressRing
              progress={stats.completionPercentage}
              size={120}
              strokeWidth={8}
              color="#4F46E5"
            />
            <p className="text-sm text-gray-600 mt-4">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </p>
          </div>
        </Card>

        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <ApperIcon name="ArrowUpRight" size={20} className="text-gray-400" />
            </div>
            
            <TaskList
              tasks={recentTasks}
              loading={loading}
              error={error}
              onRetry={loadData}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
            />
          </Card>
        </div>
      </div>

      {/* Project Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter(task => task.projectId === project.Id);
            const completedProjectTasks = projectTasks.filter(task => task.completed);
            const completionRate = projectTasks.length > 0 
              ? Math.round((completedProjectTasks.length / projectTasks.length) * 100) 
              : 0;

            return (
              <motion.div
                key={project.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <span className="text-sm text-gray-600">{completionRate}%</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {completedProjectTasks.length} / {projectTasks.length} tasks completed
                </p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
</div>
      </Card>

      {/* Calendar Widget */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Calendar</h3>
        <CalendarWidget 
          tasks={tasks}
          projects={projects}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default Dashboard;