import { useState } from 'react';
import { motion } from 'framer-motion';
import TaskCard from '@/components/organisms/TaskCard';
import SearchBar from '@/components/molecules/SearchBar';
import FilterButtons from '@/components/molecules/FilterButtons';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';

const TaskList = ({ 
  tasks, 
  loading, 
  error, 
  onRetry, 
  onToggleComplete, 
  onEditTask, 
  onDeleteTask 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' }
  ];

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
        return matchesSearch && isToday && !task.completed;
      default:
        return matchesSearch;
    }
  });

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
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TaskList;