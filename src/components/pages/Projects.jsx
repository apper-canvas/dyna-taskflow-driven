import { useState, useEffect } from 'react';
import ProjectList from '@/components/organisms/ProjectList';
import { projectService } from '@/services/api/projectService';
import { taskService } from '@/services/api/taskService';

const Projects = () => {
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
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll()
      ]);
      
      // Add task counts to projects
      const projectsWithCounts = projectsData.map(project => ({
        ...project,
        taskCount: tasksData.filter(task => task.projectId === project.Id).length
      }));
      
      setProjects(projectsWithCounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name) => {
    try {
      await projectService.create({ name });
      await loadData(); // Refresh data
    } catch (err) {
      throw new Error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await projectService.delete(projectId);
      await loadData(); // Refresh data
    } catch (err) {
      throw new Error('Failed to delete project');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Organize your tasks into projects</p>
        </div>
      </div>

      <ProjectList
        projects={projects}
        loading={loading}
        error={error}
        onRetry={loadData}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
};

export default Projects;