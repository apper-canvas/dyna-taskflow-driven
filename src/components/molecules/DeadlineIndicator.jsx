import { format, isToday, isPast, isTomorrow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

const DeadlineIndicator = ({ deadline, className = '' }) => {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const now = new Date();

  const getDeadlineStatus = () => {
    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
      return {
        text: `Overdue (${format(deadlineDate, 'MMM d')})`,
        className: 'text-error font-semibold',
        icon: 'AlertCircle'
      };
    }
    if (isToday(deadlineDate)) {
      return {
        text: 'Due Today',
        className: 'text-warning font-semibold',
        icon: 'Clock'
      };
    }
    if (isTomorrow(deadlineDate)) {
      return {
        text: 'Due Tomorrow',
        className: 'text-orange-600 font-medium',
        icon: 'Clock'
      };
    }
    return {
      text: `Due ${format(deadlineDate, 'MMM d')}`,
      className: 'text-gray-600',
      icon: 'Calendar'
    };
  };

  const status = getDeadlineStatus();

  return (
    <div className={`flex items-center space-x-1 text-sm ${status.className} ${className}`}>
      <ApperIcon name={status.icon} size={14} />
      <span>{status.text}</span>
    </div>
  );
};

export default DeadlineIndicator;