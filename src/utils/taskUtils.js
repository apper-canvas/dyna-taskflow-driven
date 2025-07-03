import { isToday, isPast, parseISO } from 'date-fns';

export const getPriorityColor = (priority) => {
  const colors = {
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };
  return colors[priority] || colors.medium;
};

export const getTasksByProject = (tasks, projectId) => {
  return tasks.filter(task => task.projectId === projectId);
};

export const getTasksByPriority = (tasks, priority) => {
  return tasks.filter(task => task.priority === priority);
};

export const getCompletedTasks = (tasks) => {
  return tasks.filter(task => task.completed);
};

export const getPendingTasks = (tasks) => {
  return tasks.filter(task => !task.completed);
};

export const getOverdueTasks = (tasks) => {
  return tasks.filter(task => {
    if (task.completed || !task.deadline) return false;
    const deadline = parseISO(task.deadline);
    return isPast(deadline) && !isToday(deadline);
  });
};

export const getTodayTasks = (tasks) => {
  return tasks.filter(task => {
    if (!task.deadline) return false;
    const deadline = parseISO(task.deadline);
    return isToday(deadline);
  });
};

export const getTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = getCompletedTasks(tasks).length;
  const pending = getPendingTasks(tasks).length;
  const overdue = getOverdueTasks(tasks).length;
  const today = getTodayTasks(tasks).length;
  const completedToday = tasks.filter(task => 
    task.completed && task.completedAt && isToday(parseISO(task.completedAt))
  ).length;

  return {
    total,
    completed,
    pending,
    overdue,
    today,
    completedToday,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

export const sortTasksByDeadline = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
};

export const groupTasksByProject = (tasks, projects) => {
  return projects.map(project => ({
    ...project,
    tasks: tasks.filter(task => task.projectId === project.Id)
  }));
};

export const bulkCompleteValidation = (taskIds, tasks) => {
  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return { valid: false, message: 'No tasks selected' };
  }
  
  const validTasks = tasks.filter(task => taskIds.includes(task.Id));
  if (validTasks.length !== taskIds.length) {
    return { valid: false, message: 'Some selected tasks not found' };
  }
  
  return { valid: true, tasks: validTasks };
};

export const bulkDeleteValidation = (taskIds, tasks) => {
  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return { valid: false, message: 'No tasks selected' };
  }
  
  const validTasks = tasks.filter(task => taskIds.includes(task.Id));
  if (validTasks.length !== taskIds.length) {
    return { valid: false, message: 'Some selected tasks not found' };
  }
  
  return { valid: true, tasks: validTasks };
};

export const bulkMoveValidation = (taskIds, tasks, targetProjectId) => {
  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return { valid: false, message: 'No tasks selected' };
  }
  
  if (!targetProjectId) {
    return { valid: false, message: 'No target project selected' };
  }
  
  const validTasks = tasks.filter(task => taskIds.includes(task.Id));
  if (validTasks.length !== taskIds.length) {
    return { valid: false, message: 'Some selected tasks not found' };
  }
return { valid: true, tasks: validTasks };
};

export const getTasksByDate = (tasks, date) => {
  return tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === date.toDateString();
  });
};

export const getTasksForMonth = (tasks, year, month) => {
  return tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate.getFullYear() === year && taskDate.getMonth() === month;
  });
};

export const getCalendarData = (tasks, year, month) => {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const calendar = [];
  const currentDate = new Date(startDate);
  
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(currentDate);
      const tasksForDate = getTasksByDate(tasks, date);
      const isToday = date.toDateString() === today.toDateString();
      const isOverdue = date < today && !isToday;
      const isCurrentMonth = date.getMonth() === month;
      
      weekDays.push({
        date: new Date(date),
        day: date.getDate(),
        tasks: tasksForDate,
        isToday,
        isOverdue,
        isCurrentMonth,
        hasOverdue: tasksForDate.some(task => !task.completed && isOverdue),
        hasDueToday: tasksForDate.some(task => !task.completed && isToday)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    calendar.push(weekDays);
  }
  
  return calendar;
};