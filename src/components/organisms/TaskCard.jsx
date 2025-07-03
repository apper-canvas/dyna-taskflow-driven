import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import PriorityBadge from '@/components/molecules/PriorityBadge';
import ProjectTag from '@/components/molecules/ProjectTag';
import DeadlineIndicator from '@/components/molecules/DeadlineIndicator';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await onToggleComplete(task.Id, !task.completed);
      toast.success(task.completed ? 'Task marked as pending' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await onDelete(task.Id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card 
      className={`relative transition-all duration-200 ${
        task.completed ? 'opacity-75 bg-gray-50' : 'bg-white hover:shadow-md'
      }`}
      padding="md"
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            task.completed
              ? 'bg-success border-success text-white'
              : 'border-gray-300 hover:border-success'
          }`}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center w-full h-full"
            >
              <ApperIcon name="Check" size={14} />
            </motion.div>
          )}
        </motion.button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-medium text-gray-900 ${
                task.completed ? 'line-through text-gray-500' : ''
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                disabled={isUpdating || isDeleting}
              >
                <ApperIcon name="Edit2" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="text-gray-400 hover:text-error"
              >
                {isDeleting ? (
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <ApperIcon name="Trash2" size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Task Meta */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <PriorityBadge priority={task.priority} />
              <ProjectTag project={task.project} />
            </div>
            <DeadlineIndicator deadline={task.deadline} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;