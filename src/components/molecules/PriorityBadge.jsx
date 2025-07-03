import Badge from '@/components/atoms/Badge';

const PriorityBadge = ({ priority, className = '' }) => {
  const priorityConfig = {
    low: { variant: 'low', label: 'Low' },
    medium: { variant: 'medium', label: 'Medium' },
    high: { variant: 'high', label: 'High' }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default PriorityBadge;