import React, { useState } from "react";
import { motion } from "framer-motion";
import { isOverdue } from "@/utils/dateUtils";
import ApperIcon from "@/components/ApperIcon";
import TaskCard from "@/components/organisms/TaskCard";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterButtons from "@/components/molecules/FilterButtons";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const TaskList = ({ 
  tasks, 
  loading, 
  error, 
  onRetry, 
  onToggleComplete, 
  onEditTask, 
  onDeleteTask,
  onBulkComplete,
  onBulkDelete,
onBulkMove,
  projects = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' }
  ];

  const getHighlightedTitle = (task) => {
    if (!searchTerm) return task.title;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return task.title.replace(regex, '<mark class="bg-yellow-200 text-yellow-800 px-1 rounded">$1</mark>');
  };

  const getHighlightedDescription = (task) => {
    if (!searchTerm || !task.description) return task.description;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return task.description.replace(regex, '<mark class="bg-yellow-200 text-yellow-800 px-1 rounded">$1</mark>');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const taskDeadline = new Date(task.deadline);
    const isToday = taskDeadline.toDateString() === now.toDateString();
    const isOverdue = taskDeadline < now && !task.completed;

    switch (activeFilter) {
      case 'pending':
        return matchesSearch && !task.completed;
      case 'completed':
        return matchesSearch && task.completed;
      case 'overdue':
        return matchesSearch && isOverdue;
      case 'today':
        return matchesSearch && isToday;
      default:
        return matchesSearch;
    }
  });

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.Id));
    }
  };

  const handleBulkCompleteAction = async () => {
    if (selectedTasks.length === 0) return;
    
    setIsBulkOperating(true);
    try {
      await onBulkComplete(selectedTasks);
      setSelectedTasks([]);
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkDeleteAction = async () => {
    if (selectedTasks.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}?`)) {
      setIsBulkOperating(true);
      try {
        await onBulkDelete(selectedTasks);
        setSelectedTasks([]);
      } finally {
        setIsBulkOperating(false);
      }
    }
  };

  const handleBulkMoveAction = async (projectId) => {
    if (selectedTasks.length === 0 || !projectId) return;
    
    setIsBulkOperating(true);
    try {
      await onBulkMove(selectedTasks, projectId);
      setSelectedTasks([]);
    } finally {
      setIsBulkOperating(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar
          placeholder="Search tasks..."
          onSearch={setSearchTerm}
          className="w-full"
        />
        
        <FilterButtons
          filters={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
</div>

      {/* Bulk Actions Toolbar */}
      {selectedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-primary">
                {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={isBulkOperating}
              >
                {selectedTasks.length === filteredTasks.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="success"
                size="sm"
                onClick={handleBulkCompleteAction}
                disabled={isBulkOperating}
              >
                <ApperIcon name="Check" size={14} className="mr-1" />
                Complete
              </Button>
              
              <select
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                onChange={(e) => e.target.value && handleBulkMoveAction(parseInt(e.target.value))}
                disabled={isBulkOperating}
                value=""
              >
                <option value="">Move to...</option>
                {projects.map(project => (
                  <option key={project.Id} value={project.Id}>
                    {project.name}
                  </option>
                ))}
              </select>
              
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDeleteAction}
                disabled={isBulkOperating}
              >
                <ApperIcon name="Trash2" size={14} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {filteredTasks.length === 0 ? (
        <Empty
          title={searchTerm ? "No tasks found" : "No tasks yet"}
          description={searchTerm ? "Try adjusting your search terms" : "Create your first task to get started"}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
<TaskCard
                task={{
                  ...task,
                  title: getHighlightedTitle(task),
                  description: getHighlightedDescription(task)
                }}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                isSelected={selectedTasks.includes(task.Id)}
                onSelect={handleSelectTask}
                htmlContent={true}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TaskList;