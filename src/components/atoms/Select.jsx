import { forwardRef } from 'react';

const Select = forwardRef(({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className = '', 
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = "w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white";
  const errorClasses = error 
    ? "border-error focus:ring-error/50 focus:border-error" 
    : "border-gray-300";
  const disabledClasses = disabled 
    ? "bg-gray-50 cursor-not-allowed" 
    : "";

  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;