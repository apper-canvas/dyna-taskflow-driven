import { toast } from 'react-toastify';

class SubtaskService {
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
          { field: { Name: "description" } },
          { field: { Name: "task_id" } },
          { field: { Name: "completed" } },
          { field: { Name: "deadline" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('subtask', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Map database fields to application format
      return response.data.map(subtask => ({
        Id: subtask.Id,
        name: subtask.Name || '',
        description: subtask.description || '',
        taskId: subtask.task_id,
        completed: subtask.completed === "true" || subtask.completed === true,
        deadline: subtask.deadline
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching subtasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getByTaskId(taskId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "description" } },
          { field: { Name: "task_id" } },
          { field: { Name: "completed" } },
          { field: { Name: "deadline" } }
        ],
        where: [
          {
            FieldName: "task_id",
            Operator: "EqualTo",
            Values: [parseInt(taskId)]
          }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('subtask', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Map database fields to application format
      return response.data.map(subtask => ({
        Id: subtask.Id,
        name: subtask.Name || '',
        description: subtask.description || '',
        taskId: subtask.task_id,
        completed: subtask.completed === "true" || subtask.completed === true,
        deadline: subtask.deadline
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching subtasks for task ${taskId}:`, error?.response?.data?.message);
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
          { field: { Name: "description" } },
          { field: { Name: "task_id" } },
          { field: { Name: "completed" } },
          { field: { Name: "deadline" } }
        ]
      };

      const response = await this.apperClient.getRecordById('subtask', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (!response.data) {
        return null;
      }

      // Map database fields to application format
      const subtask = response.data;
      return {
        Id: subtask.Id,
        name: subtask.Name || '',
        description: subtask.description || '',
        taskId: subtask.task_id,
        completed: subtask.completed === "true" || subtask.completed === true,
        deadline: subtask.deadline
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching subtask with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(subtaskData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter fields based on visibility - only include Updateable fields
      const params = {
        records: [{
          Name: subtaskData.name,
          description: subtaskData.description || '',
          task_id: parseInt(subtaskData.taskId),
          completed: subtaskData.completed ? "true" : "false",
          deadline: subtaskData.deadline || null
        }]
      };

      const response = await this.apperClient.createRecord('subtask', params);
      
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
          toast.success('Subtask created successfully!');
          const subtask = successfulRecords[0].data;
          return {
            Id: subtask.Id,
            name: subtask.Name || '',
            description: subtask.description || '',
            taskId: subtask.task_id,
            completed: subtask.completed === "true" || subtask.completed === true,
            deadline: subtask.deadline
          };
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating subtask:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to create subtask');
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

      if (updates.name !== undefined) updateData.Name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.taskId !== undefined) updateData.task_id = parseInt(updates.taskId);
      if (updates.completed !== undefined) updateData.completed = updates.completed ? "true" : "false";
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('subtask', params);
      
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
          toast.success('Subtask updated successfully!');
          const subtask = successfulUpdates[0].data;
          return {
            Id: subtask.Id,
            name: subtask.Name || '',
            description: subtask.description || '',
            taskId: subtask.task_id,
            completed: subtask.completed === "true" || subtask.completed === true,
            deadline: subtask.deadline
          };
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating subtask:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to update subtask');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('subtask', params);
      
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
          toast.success('Subtask deleted successfully!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting subtask:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to delete subtask');
      return false;
    }
  }

  async bulkComplete(subtaskIds) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      if (!Array.isArray(subtaskIds) || subtaskIds.length === 0) {
        throw new Error('Invalid subtask IDs provided');
      }

      const records = subtaskIds.map(id => ({
        Id: parseInt(id),
        completed: "true"
      }));

      const params = { records };

      const response = await this.apperClient.updateRecord('subtask', params);
      
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
          toast.success(`${successfulUpdates.length} subtasks completed successfully!`);
          return successfulUpdates.map(result => ({
            Id: result.data.Id,
            name: result.data.Name || '',
            description: result.data.description || '',
            taskId: result.data.task_id,
            completed: result.data.completed === "true" || result.data.completed === true,
            deadline: result.data.deadline
          }));
        }
      }
      
      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error completing subtasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to complete subtasks');
      return [];
    }
  }

  async bulkDelete(subtaskIds) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      if (!Array.isArray(subtaskIds) || subtaskIds.length === 0) {
        throw new Error('Invalid subtask IDs provided');
      }

      const params = {
        RecordIds: subtaskIds.map(id => parseInt(id))
      };

      const response = await this.apperClient.deleteRecord('subtask', params);
      
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
          toast.success(`${successfulDeletions.length} subtasks deleted successfully!`);
        }
        
        return { deletedCount: successfulDeletions.length };
      }
      
      return { deletedCount: 0 };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting subtasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Failed to delete subtasks');
      return { deletedCount: 0 };
    }
  }
}

export const subtaskService = new SubtaskService();