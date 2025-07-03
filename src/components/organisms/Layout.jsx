import { useState } from 'react';
import Header from '@/components/organisms/Header';
import TaskModal from '@/components/organisms/TaskModal';

const Layout = ({ children }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCreateTask = () => {
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateTask={handleCreateTask} />
      
      <main className="flex-1">
        {children}
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
};

export default Layout;