import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  padding = 'md',
  ...props 
}) => {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200";
  const hoverClasses = hoverable 
    ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer" 
    : "";
  
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    none: ""
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;