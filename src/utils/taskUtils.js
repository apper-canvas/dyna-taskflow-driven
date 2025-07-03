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

// Recurring Task Utilities
export const generateRecurringTasks = (templateTask, pattern, startDate, endDate) => {
  const tasks = [];
  const dates = calculateRecurrenceDates(pattern, startDate, endDate);
  
  dates.forEach(date => {
    tasks.push({
      ...templateTask,
      deadline: date.toISOString(),
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      isRecurring: true,
      recurringId: templateTask.recurringId || Date.now()
    });
  });
  
  return tasks;
};

export const getNextOccurrence = (lastDate, pattern) => {
  const date = new Date(lastDate);
  
  switch (pattern.type) {
    case 'daily':
      date.setDate(date.getDate() + (pattern.interval || 1));
      break;
    case 'weekly':
      date.setDate(date.getDate() + (7 * (pattern.interval || 1)));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + (pattern.interval || 1));
      break;
    default:
      return null;
  }
  
  return date;
};

export const validateRecurringPattern = (pattern) => {
  if (!pattern || !pattern.type) {
    return { valid: false, message: 'Recurrence pattern is required' };
  }
  
  const validTypes = ['daily', 'weekly', 'monthly'];
  if (!validTypes.includes(pattern.type)) {
    return { valid: false, message: 'Invalid recurrence type' };
  }
  
  if (pattern.interval && (pattern.interval < 1 || pattern.interval > 365)) {
    return { valid: false, message: 'Interval must be between 1 and 365' };
  }
  
  return { valid: true };
};

export const calculateRecurrenceDates = (pattern, startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + (365 * 24 * 60 * 60 * 1000)); // Default 1 year
  
  let currentDate = new Date(start);
  
  while (currentDate <= end && dates.length < 100) { // Safety limit
    dates.push(new Date(currentDate));
    currentDate = getNextOccurrence(currentDate, pattern);
    if (!currentDate) break;
  }
  
  return dates;
};

export const getRecurringTaskStats = (tasks) => {
  const recurringTasks = tasks.filter(task => task.isRecurring);
  const activeTemplates = new Set(recurringTasks.map(task => task.recurringId)).size;
  const completedRecurring = recurringTasks.filter(task => task.completed).length;
  
  return {
    total: recurringTasks.length,
    activeTemplates,
    completed: completedRecurring,
    completionRate: recurringTasks.length > 0 ? Math.round((completedRecurring / recurringTasks.length) * 100) : 0
  };
};

export const groupTasksByRecurrence = (tasks) => {
  const recurring = tasks.filter(task => task.isRecurring);
  const oneTime = tasks.filter(task => !task.isRecurring);
  
  const recurringGroups = recurring.reduce((groups, task) => {
    const id = task.recurringId;
    if (!groups[id]) {
      groups[id] = [];
    }
    groups[id].push(task);
    return groups;
  }, {});
  
  return {
    oneTime,
    recurring: recurringGroups
  };
};