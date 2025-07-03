import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
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
    projectId: ''
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      loadProjects();
      if (task) {
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
          projectId: ''
        });
      }
      setErrors({});
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
            </div>
        </motion.div>
    </motion.div>}
</AnimatePresence>
  );
};

export default TaskModal;