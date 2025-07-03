import { forwardRef } from 'react';

const Input = forwardRef(({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = "w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";
  const errorClasses = error 
    ? "border-error focus:ring-error/50 focus:border-error" 
    : "border-gray-300";
  const disabledClasses = disabled 
    ? "bg-gray-50 cursor-not-allowed" 
    : "bg-white";

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;