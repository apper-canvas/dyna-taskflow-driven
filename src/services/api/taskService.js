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

  async bulkComplete(taskIds) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Invalid task IDs provided');
    }
    
    const updatedTasks = [];
    for (const id of taskIds) {
      const index = this.tasks.findIndex(t => t.Id === parseInt(id));
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          completed: true,
          completedAt: new Date().toISOString()
        };
        updatedTasks.push({ ...this.tasks[index] });
      }
    }
    
    return updatedTasks;
  }

  async bulkDelete(taskIds) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Invalid task IDs provided');
    }
    
    const deletedCount = taskIds.length;
    this.tasks = this.tasks.filter(task => !taskIds.includes(task.Id));
    
    return { deletedCount };
  }

  async bulkMove(taskIds, projectId) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Invalid task IDs provided');
    }
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    const updatedTasks = [];
    for (const id of taskIds) {
      const index = this.tasks.findIndex(t => t.Id === parseInt(id));
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          projectId: parseInt(projectId)
        };
        updatedTasks.push({ ...this.tasks[index] });
      }
    }
return updatedTasks;
  }

  async createRecurringTasks(taskData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!taskData.isRecurring || !taskData.recurrencePattern) {
      throw new Error('Invalid recurring task data');
    }

    const { generateRecurringTasks, validateRecurringPattern } = await import('@/utils/taskUtils');
    
    // Validate recurrence pattern
    const validation = validateRecurringPattern(taskData.recurrencePattern);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Generate recurring ID
    const recurringId = Date.now();
    
    // Create template task without recurring fields
    const templateTask = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      projectId: parseInt(taskData.projectId),
      completed: false,
      isRecurring: true,
      recurringId: recurringId,
      recurrencePattern: taskData.recurrencePattern
    };

    // Generate recurring tasks
    const startDate = new Date(taskData.deadline);
    const endDate = taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : null;
    
    const recurringTasks = generateRecurringTasks(
      templateTask,
      taskData.recurrencePattern,
      startDate,
      endDate
    );

    // Add IDs and save all tasks
    const savedTasks = [];
    for (const task of recurringTasks) {
      const newTask = {
        ...task,
        Id: Math.max(...this.tasks.map(t => t.Id), 0) + 1
      };
      this.tasks.push(newTask);
      savedTasks.push({ ...newTask });
    }

    return savedTasks;
  }

  async getRecurringTemplates() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const recurringTasks = this.tasks.filter(task => task.isRecurring);
    const templates = {};
    
    recurringTasks.forEach(task => {
      if (!templates[task.recurringId]) {
        templates[task.recurringId] = {
          id: task.recurringId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          projectId: task.projectId,
          recurrencePattern: task.recurrencePattern,
          totalTasks: 0,
          completedTasks: 0,
          nextDueDate: null
        };
      }
      
      templates[task.recurringId].totalTasks++;
      if (task.completed) {
        templates[task.recurringId].completedTasks++;
      }
      
      // Find next due date
      if (!task.completed && task.deadline) {
        const dueDate = new Date(task.deadline);
        if (!templates[task.recurringId].nextDueDate || dueDate < templates[task.recurringId].nextDueDate) {
          templates[task.recurringId].nextDueDate = dueDate;
        }
      }
    });
    
    return Object.values(templates);
  }

  async deleteRecurringTemplate(recurringId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const deletedTasks = this.tasks.filter(task => task.recurringId === parseInt(recurringId));
    this.tasks = this.tasks.filter(task => task.recurringId !== parseInt(recurringId));
    
    return { deletedCount: deletedTasks.length };
  }
}

export const taskService = new TaskService();