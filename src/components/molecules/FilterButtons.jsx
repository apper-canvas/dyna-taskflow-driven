import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';

const FilterButtons = ({ 
  filters, 
  activeFilter, 
  onFilterChange, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <motion.div
          key={filter.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeFilter === filter.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="text-xs"
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {filter.count}
              </span>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default FilterButtons;