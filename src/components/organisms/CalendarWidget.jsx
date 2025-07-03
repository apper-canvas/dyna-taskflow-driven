import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { getCalendarData } from '@/utils/taskUtils';
import { getPriorityColor } from '@/utils/taskUtils';

const CalendarWidget = ({ tasks, projects, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return getCalendarData(tasks, currentYear, currentMonth);
  }, [tasks, currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleDateClick = (dayData) => {
    setSelectedDate(dayData.date);
  };

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate || !tasks) return [];
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, tasks]);

  const getTaskPriorityCount = (tasks, priority) => {
    return tasks.filter(task => task.priority === priority && !task.completed).length;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100"
          >
            <ApperIcon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100"
          >
            <ApperIcon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarData.map((week, weekIndex) =>
          week.map((dayData, dayIndex) => (
            <motion.div
              key={`${weekIndex}-${dayIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
              className={`
                relative p-2 min-h-20 cursor-pointer rounded-lg border-2 transition-all duration-200
                ${dayData.isCurrentMonth 
                  ? 'bg-white border-gray-200 hover:border-primary/50 hover:shadow-sm' 
                  : 'bg-gray-50 border-gray-100 text-gray-400'
                }
                ${dayData.isToday 
                  ? 'border-primary bg-primary/5' 
                  : ''
                }
                ${selectedDate && selectedDate.toDateString() === dayData.date.toDateString()
                  ? 'border-primary bg-primary/10 shadow-md'
                  : ''
                }
              `}
              onClick={() => handleDateClick(dayData)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${dayData.isToday ? 'text-primary font-bold' : ''}`}>
                  {dayData.day}
                </span>
                {dayData.tasks.length > 0 && (
                  <Badge
                    variant="secondary"
                    className={`
                      text-xs px-1.5 py-0.5 min-w-5 h-5
                      ${dayData.hasOverdue 
                        ? 'bg-red-100 text-red-700 border-red-200' 
                        : dayData.hasDueToday 
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }
                    `}
                  >
                    {dayData.tasks.length}
                  </Badge>
                )}
              </div>

              {/* Task Indicators */}
              {dayData.tasks.length > 0 && (
                <div className="space-y-1">
                  {dayData.tasks.slice(0, 3).map((task, index) => (
                    <div
                      key={task.Id}
                      className={`
                        text-xs px-2 py-1 rounded truncate
                        ${task.completed 
                          ? 'bg-green-100 text-green-700 line-through' 
                          : getPriorityColor(task.priority).bg + ' ' + getPriorityColor(task.priority).text
                        }
                      `}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayData.tasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayData.tasks.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDateTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg border"
        >
          <h5 className="font-medium text-gray-900 mb-3">
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </h5>
          <div className="space-y-2">
            {selectedDateTasks.map(task => {
              const project = projects.find(p => p.Id === task.projectId);
              return (
                <div
                  key={task.Id}
                  className={`
                    flex items-center justify-between p-3 bg-white rounded-lg border
                    ${task.completed ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority).bg}`}></div>
                    <div>
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {project && (
                        <p className="text-sm text-gray-500">{project.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={`
                        ${getPriorityColor(task.priority).bg} 
                        ${getPriorityColor(task.priority).text}
                        ${getPriorityColor(task.priority).border}
                      `}
                    >
                      {task.priority}
                    </Badge>
                    {task.completed && (
                      <ApperIcon name="CheckCircle" size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Calendar Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-200"></div>
          <span>Overdue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-200"></div>
          <span>Due Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-200"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-200"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;