import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { subtaskService } from "@/services/api/subtaskService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";

const TaskModal = ({ isOpen, onClose, task = null, mode = 'view' }) => {
  const [currentMode, setCurrentMode] = useState(mode);
const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    projectId: '',
    isRecurring: false,
    recurrencePattern: {
      type: 'days',
      interval: 1
    },
    recurrenceEndDate: ''
  });
const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newSubtask, setNewSubtask] = useState({ name: '', description: '', deadline: '' });
  const [editingSubtask, setEditingSubtask] = useState(null);
useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      loadProjects();
      if (task) {
        loadSubtasks();
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
          projectId: task.projectId || ''
        });
} else {
        setCurrentMode('create');
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          deadline: '',
          projectId: '',
          isRecurring: false,
          recurrencePattern: {
            type: 'days',
            interval: 1
          },
          recurrenceEndDate: ''
        });
      }
      setErrors({});
      setNewSubtask({ name: '', description: '', deadline: '' });
      setEditingSubtask(null);
    }
  }, [isOpen, task, mode]);

const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadSubtasks = async () => {
    if (!task?.Id) return;
    
    setSubtasksLoading(true);
    try {
      const data = await subtaskService.getByTaskId(task.Id);
      setSubtasks(data);
    } catch (error) {
      console.error('Error loading subtasks:', error);
      toast.error('Failed to load subtasks');
    } finally {
      setSubtasksLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      };

      if (task) {
        await taskService.update(task.Id, taskData);
        toast.success('Task updated successfully!');
      } else {
        await taskService.create(taskData);
        toast.success('Task created successfully!');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = projects.map(project => ({
    value: project.Id,
label: project.name
  }));

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const recurrenceOptions = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];

  const handleRecurrenceChange = (field, value) => {
    if (field === 'isRecurring') {
      setFormData(prev => ({
        ...prev,
        isRecurring: value
      }));
    } else if (field === 'recurrenceType') {
      setFormData(prev => ({
        ...prev,
        recurrencePattern: {
          ...prev.recurrencePattern,
          type: value
        }
      }));
    } else if (field === 'recurrenceInterval') {
      setFormData(prev => ({
        ...prev,
        recurrencePattern: {
          ...prev.recurrencePattern,
          interval: parseInt(value) || 1
        }
      }));
    } else if (field === 'recurrenceEndDate') {
      setFormData(prev => ({
        ...prev,
        recurrenceEndDate: value
      }));
}
  };

  const handleSubtaskCreate = async () => {
    if (!newSubtask.name.trim() || !task?.Id) return;
    
    try {
      const subtaskData = {
        name: newSubtask.name,
        description: newSubtask.description,
        taskId: task.Id,
        deadline: newSubtask.deadline || null,
        completed: false
      };
      
      const createdSubtask = await subtaskService.create(subtaskData);
      if (createdSubtask) {
        setSubtasks(prev => [...prev, createdSubtask]);
        setNewSubtask({ name: '', description: '', deadline: '' });
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Failed to create subtask');
    }
  };

  const handleSubtaskToggle = async (subtaskId, completed) => {
    try {
      await subtaskService.update(subtaskId, { completed });
      setSubtasks(prev => prev.map(subtask => 
        subtask.Id === subtaskId ? { ...subtask, completed } : subtask
      ));
    } catch (error) {
      console.error('Error updating subtask:', error);
      toast.error('Failed to update subtask');
    }
  };

  const handleSubtaskEdit = (subtask) => {
    setEditingSubtask(subtask);
  };

  const handleSubtaskUpdate = async () => {
    if (!editingSubtask || !editingSubtask.name.trim()) return;
    
    try {
      const updatedSubtask = await subtaskService.update(editingSubtask.Id, {
        name: editingSubtask.name,
        description: editingSubtask.description,
        deadline: editingSubtask.deadline
      });
      
      if (updatedSubtask) {
        setSubtasks(prev => prev.map(subtask => 
          subtask.Id === editingSubtask.Id ? updatedSubtask : subtask
        ));
        setEditingSubtask(null);
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      toast.error('Failed to update subtask');
    }
  };

  const handleSubtaskDelete = async (subtaskId) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      try {
        const success = await subtaskService.delete(subtaskId);
        if (success) {
          setSubtasks(prev => prev.filter(subtask => subtask.Id !== subtaskId));
        }
      } catch (error) {
        console.error('Error deleting subtask:', error);
        toast.error('Failed to delete subtask');
      }
    }
  };
  return (
    <AnimatePresence>
    {isOpen && <motion.div
        initial={{
            opacity: 0
        }}
        animate={{
            opacity: 1
        }}
        exit={{
            opacity: 0
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.9,
                y: 20
            }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0
            }}
            exit={{
                opacity: 0,
                scale: 0.9,
                y: 20
            }}
            transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
            }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {currentMode === "view" ? "Task Details" : currentMode === "edit" ? "Edit Task" : "Create New Task"}
                    </h2>
                    <div className="flex items-center space-x-2">
                        {task && currentMode === "view" && <Button variant="ghost" size="sm" onClick={() => setCurrentMode("edit")}>
                            <ApperIcon name="Edit2" size={16} className="mr-2" />Edit
                                                </Button>}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                            <ApperIcon name="X" size={20} />
                        </button>
                    </div>
                </div>
                {currentMode === "view" ? <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{formData.title}</h3>
                        {formData.description && <p className="text-gray-600 leading-relaxed">{formData.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formData.priority === "high" ? "bg-red-100 text-red-800" : formData.priority === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                            <p className="text-gray-900">
                                {formData.deadline ? format(new Date(formData.deadline), "MMM dd, yyyy") : "No deadline set"}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <p className="text-gray-900">
                            {projects.find(p => p.Id === parseInt(formData.projectId))?.name || "No project assigned"}
                        </p>
                    </div>
{task?.completed && <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <ApperIcon name="CheckCircle" size={20} className="text-green-600 mr-3" />
                            <div>
                                <p className="text-green-800 font-medium">Task Completed</p>
                                {task.completedAt && <p className="text-green-600 text-sm">Completed on {format(new Date(task.completedAt), "MMM dd, yyyy")}
                                </p>}
                            </div>
                        </div>
                    </div>}
                    
                    {/* Subtasks Section */}
                    {task && (
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">Subtasks</h4>
                          <span className="text-sm text-gray-500">
                            {subtasks.filter(s => s.completed).length} of {subtasks.length} completed
                          </span>
                        </div>
                        
                        {subtasksLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <ApperIcon name="Loader2" size={20} className="animate-spin text-gray-400" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {subtasks.map(subtask => (
                              <div key={subtask.Id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <button
                                  onClick={() => handleSubtaskToggle(subtask.Id, !subtask.completed)}
                                  className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                                    subtask.completed 
                                      ? 'bg-success border-success text-white' 
                                      : 'border-gray-300 hover:border-success'
                                  }`}
                                >
                                  {subtask.completed && (
                                    <ApperIcon name="Check" size={12} className="w-full h-full" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {subtask.name}
                                  </p>
                                  {subtask.description && (
                                    <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                                  )}
                                  {subtask.deadline && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Due: {format(new Date(subtask.deadline), "MMM dd, yyyy")}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSubtaskEdit(subtask)}
                                  >
                                    <ApperIcon name="Edit2" size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSubtaskDelete(subtask.Id)}
                                    className="text-gray-400 hover:text-error"
                                  >
                                    <ApperIcon name="Trash2" size={14} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            {subtasks.length === 0 && (
                              <p className="text-center text-gray-500 py-4">No subtasks yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Close
                                                </Button>
                        <Button type="button" variant="primary" onClick={() => setCurrentMode("edit")}>
                            <ApperIcon name="Edit2" size={16} className="mr-2" />Edit Task
                                                </Button>
                    </div>
                </div> : <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter task title"
                        required
                        error={errors.title} />
                    <FormField
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter task description (optional)"
                        rows={3} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Priority"
                            name="priority"
                            type="select"
                            value={formData.priority}
                            onChange={handleInputChange}
                            options={priorityOptions}
                            required />
                        <FormField
                            label="Deadline"
                            name="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={handleInputChange}
required
                            error={errors.deadline} />
                    </div>
                    
                    {/* Recurring Task Section */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={formData.isRecurring}
                                onChange={(e) => handleRecurrenceChange('isRecurring', e.target.checked)}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700">
                                Make this a recurring task
                            </label>
                        </div>
                        
                        {formData.isRecurring && (
                            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        label="Repeat Every"
                                        name="recurrenceType"
                                        type="select"
                                        value={formData.recurrencePattern.type}
                                        onChange={(e) => handleRecurrenceChange('recurrenceType', e.target.value)}
                                        options={recurrenceOptions}
                                        required />
                                    <FormField
                                        label="Interval"
                                        name="recurrenceInterval"
                                        type="number"
                                        value={formData.recurrencePattern.interval}
                                        onChange={(e) => handleRecurrenceChange('recurrenceInterval', e.target.value)}
                                        min="1"
                                        max="365"
                                        placeholder="1"
                                        required
                                        error={errors.recurrenceInterval} />
                                </div>
                                <FormField
                                    label="End Date"
                                    name="recurrenceEndDate"
                                    type="date"
                                    value={formData.recurrenceEndDate}
                                    onChange={(e) => handleRecurrenceChange('recurrenceEndDate', e.target.value)}
                                    required
                                    error={errors.recurrenceEndDate} />
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-start">
                                        <ApperIcon name="Info" size={16} className="text-blue-600 mr-2 mt-0.5" />
                                        <div className="text-sm text-blue-700">
                                            <p className="font-medium">Recurring Task Preview</p>
                                            <p>This will create multiple tasks repeating every {formData.recurrencePattern.interval} {formData.recurrencePattern.type.slice(0, -2)}{formData.recurrencePattern.interval > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
<FormField
                        label="Project"
                        name="projectId"
                        type="select"
                        value={formData.projectId}
                        onChange={handleInputChange}
                        options={projectOptions}
                        placeholder="Select a project"
                        required
                        error={errors.projectId} />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => task ? setCurrentMode("view") : onClose()}
                            disabled={loading}>
                            {task ? "Cancel" : "Cancel"}
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <>
                                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />Saving...
                                                        </> : <>
                                <ApperIcon name="Check" size={16} className="mr-2" />
                                {task ? "Update Task" : "Create Task"}
                            </>}
                        </Button>
                    </div>
</form>}
                
                {/* Subtasks Section for Edit Mode */}
                {currentMode !== 'view' && task && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Subtasks</h4>
                    
                    {/* Existing Subtasks */}
                    {subtasksLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <ApperIcon name="Loader2" size={20} className="animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {subtasks.map(subtask => (
                          <div key={subtask.Id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => handleSubtaskToggle(subtask.Id, !subtask.completed)}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                                subtask.completed 
                                  ? 'bg-success border-success text-white' 
                                  : 'border-gray-300 hover:border-success'
                              }`}
                            >
                              {subtask.completed && (
                                <ApperIcon name="Check" size={12} className="w-full h-full" />
                              )}
                            </button>
                            
                            {editingSubtask?.Id === subtask.Id ? (
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={editingSubtask.name}
                                  onChange={(e) => setEditingSubtask({...editingSubtask, name: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="Subtask name"
                                />
                                <textarea
                                  value={editingSubtask.description}
                                  onChange={(e) => setEditingSubtask({...editingSubtask, description: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="Description (optional)"
                                  rows="2"
                                />
                                <input
                                  type="date"
                                  value={editingSubtask.deadline ? format(new Date(editingSubtask.deadline), 'yyyy-MM-dd') : ''}
                                  onChange={(e) => setEditingSubtask({...editingSubtask, deadline: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSubtaskUpdate}
                                  >
                                    <ApperIcon name="Check" size={14} className="mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setEditingSubtask(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <p className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {subtask.name}
                                  </p>
                                  {subtask.description && (
                                    <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                                  )}
                                  {subtask.deadline && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Due: {format(new Date(subtask.deadline), "MMM dd, yyyy")}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSubtaskEdit(subtask)}
                                  >
                                    <ApperIcon name="Edit2" size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSubtaskDelete(subtask.Id)}
                                    className="text-gray-400 hover:text-error"
                                  >
                                    <ApperIcon name="Trash2" size={14} />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add New Subtask */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h5 className="font-medium text-gray-900 mb-3">Add New Subtask</h5>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newSubtask.name}
                          onChange={(e) => setNewSubtask({...newSubtask, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Subtask name"
                        />
                        <textarea
                          value={newSubtask.description}
                          onChange={(e) => setNewSubtask({...newSubtask, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Description (optional)"
                          rows="2"
                        />
                        <input
                          type="date"
                          value={newSubtask.deadline}
                          onChange={(e) => setNewSubtask({...newSubtask, deadline: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSubtaskCreate}
                          disabled={!newSubtask.name.trim()}
                        >
                          <ApperIcon name="Plus" size={14} className="mr-1" />
                          Add Subtask
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        </motion.div>
    </motion.div>}
</AnimatePresence>
  );
};

export default TaskModal;