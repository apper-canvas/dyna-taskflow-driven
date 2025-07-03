import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110 focus:ring-primary/50 shadow-md hover:shadow-lg",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200",
    success: "bg-gradient-to-r from-success to-emerald-600 text-white hover:brightness-110 focus:ring-success/50 shadow-md hover:shadow-lg",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:brightness-110 focus:ring-error/50 shadow-md hover:shadow-lg",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed pointer-events-none" 
    : "cursor-pointer";

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;