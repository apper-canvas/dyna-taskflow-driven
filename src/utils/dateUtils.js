import { format, isToday, isPast, isTomorrow, parseISO } from 'date-fns';

export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
};

export const formatDateTime = (date, formatString = 'MMM d, yyyy h:mm a') => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
};

export const getRelativeDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(parsedDate)) {
    return 'Today';
  } else if (isTomorrow(parsedDate)) {
    return 'Tomorrow';
  } else if (isPast(parsedDate)) {
    return `${format(parsedDate, 'MMM d')} (Past)`;
  } else {
    return format(parsedDate, 'MMM d');
  }
};

export const isOverdue = (date) => {
  if (!date) return false;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isPast(parsedDate) && !isToday(parsedDate);
};

export const isDueToday = (date) => {
  if (!date) return false;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isToday(parsedDate);
};

export const isDueTomorrow = (date) => {
  if (!date) return false;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isTomorrow(parsedDate);
};