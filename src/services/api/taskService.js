import mockTasks from '@/services/mockData/tasks.json';

class TaskService {
  constructor() {
    this.tasks = [...mockTasks];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.tasks];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const task = this.tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  }

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTask = {
      Id: Math.max(...this.tasks.map(t => t.Id), 0) + 1,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      deadline: taskData.deadline,
      projectId: parseInt(taskData.projectId),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...this.tasks[index],
      ...updates,
      completedAt: updates.completed && !this.tasks[index].completed 
        ? new Date().toISOString() 
        : this.tasks[index].completedAt
    };
    
    this.tasks[index] = updatedTask;
    return { ...updatedTask };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    this.tasks.splice(index, 1);
    return true;
  }
}

export const taskService = new TaskService();