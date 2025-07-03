import { toast } from 'react-toastify';

class TaskService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "priority" } },
          { field: { Name: "deadline" } },
          { field: { Name: "project_id" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } },
          { field: { Name: "completed_at" } },
          { field: { Name: "is_recurring" } },
          { field: { Name: "recurring_id" } },
          { field: { Name: "recurrence_pattern" } }
        ],
        orderBy: [
          { fieldName: "created_at", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Map database fields to application format
      return response.data.map(task => ({
        Id: task.Id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        deadline: task.deadline,
        projectId: task.project_id,
        completed: task.completed || false,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        isRecurring: task.is_recurring || false,
        recurringId: task.recurring_id,
        recurrencePattern: task.recurrence_pattern
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "priority" } },
          { field: { Name: "deadline" } },
          { field: { Name: "project_id" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } },
          { field: { Name: "completed_at" } },
          { field: { Name: "is_recurring" } },
          { field: { Name: "recurring_id" } },
          { field: { Name: "recurrence_pattern" } }
        ]
      };

      const response = await this.apperClient.getRecordById('task', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (!response.data) {
        return null;
      }

      // Map database fields to application format
      const task = response.data;
      return {
        Id: task.Id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        deadline: task.deadline,
        projectId: task.project_id,
        completed: task.completed || false,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        isRecurring: task.is_recurring || false,
        recurringId: task.recurring_id,
        recurrencePattern: task.recurrence_pattern
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(taskData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter fields based on visibility - only include Updateable fields
      const params = {
        records: [{
          title: taskData.title,
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          deadline: taskData.deadline,
          project_id: parseInt(taskData.projectId),
          completed: taskData.completed || false,
          created_at: new Date().toISOString(),
          is_recurring: taskData.isRecurring || false,
          recurring_id: taskData.recurringId || null,
          recurrence_pattern: taskData.recurrencePattern || null
        }]
      };

      const response = await this.apperClient.createRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Task created successfully!');
          const task = successfulRecords[0].data;
          return {
            Id: task.Id,
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'medium',
            deadline: task.deadline,
            projectId: task.project_id,
            completed: task.completed || false,
            createdAt: task.created_at,
            completedAt: task.completed_at,
            isRecurring: task.is_recurring || false,
            recurringId: task.recurring_id,
            recurrencePattern: task.recurrence_pattern
          };
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to create task');
      return null;
    }
  }

  async update(id, updates) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter fields based on visibility - only include Updateable fields
      const updateData = {
        Id: parseInt(id)
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
      if (updates.projectId !== undefined) updateData.project_id = parseInt(updates.projectId);
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed;
        if (updates.completed) {
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
      if (updates.recurringId !== undefined) updateData.recurring_id = updates.recurringId;
      if (updates.recurrencePattern !== undefined) updateData.recurrence_pattern = updates.recurrencePattern;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Task updated successfully!');
          const task = successfulUpdates[0].data;
          return {
            Id: task.Id,
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'medium',
            deadline: task.deadline,
            projectId: task.project_id,
            completed: task.completed || false,
            createdAt: task.created_at,
            completedAt: task.completed_at,
            isRecurring: task.is_recurring || false,
            recurringId: task.recurring_id,
            recurrencePattern: task.recurrence_pattern
          };
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to update task');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Task deleted successfully!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to delete task');
      return false;
    }
  }

  async bulkComplete(taskIds) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        throw new Error('Invalid task IDs provided');
      }

      const records = taskIds.map(id => ({
        Id: parseInt(id),
        completed: true,
        completed_at: new Date().toISOString()
      }));

      const params = { records };

      const response = await this.apperClient.updateRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to complete ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success(`${successfulUpdates.length} tasks completed successfully!`);
          return successfulUpdates.map(result => ({
            Id: result.data.Id,
            title: result.data.title || '',
            description: result.data.description || '',
            priority: result.data.priority || 'medium',
            deadline: result.data.deadline,
            projectId: result.data.project_id,
            completed: result.data.completed || false,
            createdAt: result.data.created_at,
            completedAt: result.data.completed_at,
            isRecurring: result.data.is_recurring || false,
            recurringId: result.data.recurring_id,
            recurrencePattern: result.data.recurrence_pattern
          }));
        }
      }
      
      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error completing tasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to complete tasks');
      return [];
    }
  }

  async bulkDelete(taskIds) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        throw new Error('Invalid task IDs provided');
      }

      const params = {
        RecordIds: taskIds.map(id => parseInt(id))
      };

      const response = await this.apperClient.deleteRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { deletedCount: 0 };
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} tasks deleted successfully!`);
        }
        
        return { deletedCount: successfulDeletions.length };
      }
      
      return { deletedCount: 0 };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting tasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to delete tasks');
      return { deletedCount: 0 };
    }
  }

  async bulkMove(taskIds, projectId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        throw new Error('Invalid task IDs provided');
      }

      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const records = taskIds.map(id => ({
        Id: parseInt(id),
        project_id: parseInt(projectId)
      }));

      const params = { records };

      const response = await this.apperClient.updateRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to move ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success(`${successfulUpdates.length} tasks moved successfully!`);
          return successfulUpdates.map(result => ({
            Id: result.data.Id,
            title: result.data.title || '',
            description: result.data.description || '',
            priority: result.data.priority || 'medium',
            deadline: result.data.deadline,
            projectId: result.data.project_id,
            completed: result.data.completed || false,
            createdAt: result.data.created_at,
            completedAt: result.data.completed_at,
            isRecurring: result.data.is_recurring || false,
            recurringId: result.data.recurring_id,
            recurrencePattern: result.data.recurrence_pattern
          }));
        }
      }
      
      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error moving tasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to move tasks');
      return [];
    }
  }

  // Additional methods for recurring tasks (simplified for database integration)
  async createRecurringTasks(taskData) {
    // For now, create a single task - recurring logic can be enhanced later
    return await this.create({
      ...taskData,
      isRecurring: true,
      recurringId: Date.now(),
      recurrencePattern: JSON.stringify(taskData.recurrencePattern)
    });
  }

  async getRecurringTemplates() {
    try {
      const allTasks = await this.getAll();
      const recurringTasks = allTasks.filter(task => task.isRecurring);
      
      // Group by recurring ID and create templates
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
        
        if (!task.completed && task.deadline) {
          const dueDate = new Date(task.deadline);
          if (!templates[task.recurringId].nextDueDate || dueDate < templates[task.recurringId].nextDueDate) {
            templates[task.recurringId].nextDueDate = dueDate;
          }
        }
      });
      
      return Object.values(templates);
    } catch (error) {
      console.error('Error fetching recurring templates:', error);
      return [];
    }
  }

  async deleteRecurringTemplate(recurringId) {
    try {
      const allTasks = await this.getAll();
      const recurringTasks = allTasks.filter(task => task.recurringId === parseInt(recurringId));
      const taskIds = recurringTasks.map(task => task.Id);
      
      const result = await this.bulkDelete(taskIds);
      return result;
    } catch (error) {
      console.error('Error deleting recurring template:', error);
      return { deletedCount: 0 };
    }
  }
}

export const taskService = new TaskService();