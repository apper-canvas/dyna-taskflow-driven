import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import ProgressRing from '@/components/molecules/ProgressRing';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: 'CheckSquare',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: 'CheckCircle',
      color: 'from-success to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: 'AlertCircle',
      color: 'from-error to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      icon: 'Clock',
      color: 'from-warning to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <ApperIcon name={card.icon} size={24} className={card.textColor} />
              </div>
            </div>
            
            {/* Background gradient */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;