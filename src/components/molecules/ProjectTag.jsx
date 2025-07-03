import Badge from '@/components/atoms/Badge';

const ProjectTag = ({ project, className = '' }) => {
  if (!project) return null;

  const getProjectColor = (projectName) => {
    const colors = {
      'Work': 'bg-blue-100 text-blue-800',
      'Personal': 'bg-green-100 text-green-800',
      'Shopping': 'bg-purple-100 text-purple-800'
    };
    return colors[projectName] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getProjectColor(project.name)} ${className}`}>
      {project.name}
    </span>
  );
};

export default ProjectTag;