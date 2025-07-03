import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const Empty = ({ 
  title = 'No data found', 
  description = 'Get started by creating your first item', 
  actionLabel = 'Get Started',
  onAction,
  icon = 'FileText',
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center py-12 ${className}`}
    >
      <Card className="text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full mx-auto mb-4">
          <ApperIcon name={icon} size={32} className="text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        {onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            className="inline-flex items-center"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            {actionLabel}
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

export default Empty;