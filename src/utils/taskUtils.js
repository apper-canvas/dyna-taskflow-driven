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

// Advanced Search and Fuzzy Matching Utilities
export const calculateLevenshteinDistance = (str1, str2) => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
};

export const fuzzyMatch = (searchTerm, targetText, threshold = 0.6) => {
  if (!searchTerm || !targetText) return false;
  
  const search = searchTerm.toLowerCase().trim();
  const target = targetText.toLowerCase();
  
  // Exact match
  if (target.includes(search)) return true;
  
  // Fuzzy match for single words
  if (search.length < 3) return false;
  
  const words = target.split(/\s+/);
  
  for (const word of words) {
    if (word.length < 3) continue;
    
    const distance = calculateLevenshteinDistance(search, word);
    const maxLength = Math.max(search.length, word.length);
    const similarity = 1 - (distance / maxLength);
    
    if (similarity >= threshold) return true;
  }
  
  return false;
};

export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const search = searchTerm.toLowerCase().trim();
  if (!search) return text;
  
  // Find exact matches first
  const regex = new RegExp(`(${search})`, 'gi');
  if (regex.test(text)) {
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }
  
  // For fuzzy matches, highlight the closest word
  const words = text.split(/(\s+)/);
  let bestMatch = '';
  let bestSimilarity = 0;
  
  for (const word of words) {
    if (word.length < 3 || /^\s+$/.test(word)) continue;
    
    const distance = calculateLevenshteinDistance(search, word.toLowerCase());
    const similarity = 1 - (distance / Math.max(search.length, word.length));
    
    if (similarity > bestSimilarity && similarity >= 0.6) {
      bestMatch = word;
      bestSimilarity = similarity;
    }
  }
  
  if (bestMatch) {
    const highlightRegex = new RegExp(`(${bestMatch})`, 'gi');
    return text.replace(highlightRegex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }
  
  return text;
};

export const advancedSearchTasks = (tasks, searchTerm, options = {}) => {
  const {
    searchFields = ['title', 'description'],
    fuzzyEnabled = true,
    fuzzyThreshold = 0.6,
    caseSensitive = false,
    projects = []
  } = options;
  
  if (!searchTerm || !searchTerm.trim()) return tasks;
  
  const search = caseSensitive ? searchTerm.trim() : searchTerm.toLowerCase().trim();
  
  return tasks.filter(task => {
    // Build searchable text based on selected fields
    let searchableText = '';
    
    if (searchFields.includes('title')) {
      searchableText += task.title || '';
    }
    
    if (searchFields.includes('description')) {
      searchableText += ' ' + (task.description || '');
    }
    
    if (searchFields.includes('project')) {
      const project = projects.find(p => p.Id === task.projectId);
      if (project) {
        searchableText += ' ' + project.name;
      }
    }
    
    const targetText = caseSensitive ? searchableText : searchableText.toLowerCase();
    
    // Exact match first
    if (targetText.includes(search)) return true;
    
    // Fuzzy match if enabled
    if (fuzzyEnabled) {
      return fuzzyMatch(search, targetText, fuzzyThreshold);
    }
    
    return false;
  });
};

export const getSearchSuggestions = (tasks, searchTerm, limit = 5) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const suggestions = new Set();
  const search = searchTerm.toLowerCase();
  
  tasks.forEach(task => {
    // Add matching words from title
    if (task.title) {
      const titleWords = task.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.length >= 2 && word.includes(search)) {
          suggestions.add(word);
        }
      });
    }
    
    // Add matching words from description
    if (task.description) {
      const descWords = task.description.toLowerCase().split(/\s+/);
      descWords.forEach(word => {
        if (word.length >= 2 && word.includes(search)) {
          suggestions.add(word);
        }
      });
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
};

export const searchTasksWithMetadata = (tasks, searchTerm, filters = {}) => {
  const {
    priority = null,
    completed = null,
    projectId = null,
    dateRange = null,
    searchOptions = {}
  } = filters;
  
  let filteredTasks = tasks;
  
  // Apply text search first
  if (searchTerm && searchTerm.trim()) {
    filteredTasks = advancedSearchTasks(filteredTasks, searchTerm, searchOptions);
  }
  
  // Apply metadata filters
  if (priority !== null) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  if (completed !== null) {
    filteredTasks = filteredTasks.filter(task => task.completed === completed);
  }
  
  if (projectId !== null) {
    filteredTasks = filteredTasks.filter(task => task.projectId === projectId);
  }
  
  if (dateRange) {
    filteredTasks = filteredTasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate >= dateRange.start && taskDate <= dateRange.end;
    });
  }
  
  return filteredTasks;
};