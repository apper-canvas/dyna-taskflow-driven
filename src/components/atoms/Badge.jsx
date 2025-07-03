import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  className = '', 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full transition-all duration-200";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    low: "bg-blue-50 text-blue-700 border border-blue-200",
    medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    high: "bg-red-50 text-red-700 border border-red-200"
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default Badge;