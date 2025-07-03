import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';

const ProjectList = ({ projects, loading, error, onRetry, onCreateProject, onDeleteProject }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateProject(newProjectName.trim());
      setNewProjectName('');
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete the "${projectName}" project?`)) {
      try {
        await onDeleteProject(projectId);
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-6">
      {/* Create Project Form */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
        <form onSubmit={handleCreateProject} className="flex space-x-3">
          <Input
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!newProjectName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Create
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Empty
          title="No projects yet"
          description="Create your first project to organize your tasks"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.Id, project.name)}
                    className="text-gray-400 hover:text-error"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </div>
                
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                    style={{ width: `${project.taskCount > 0 ? Math.min(project.taskCount * 10, 100) : 0}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;