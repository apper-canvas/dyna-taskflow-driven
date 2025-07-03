import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import TextArea from '@/components/atoms/TextArea';

const FormField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error, 
  options = [], 
  className = '',
  rows = 3,
  ...props 
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            options={options}
            error={!!error}
            {...props}
          />
        );
      case 'textarea':
        return (
          <TextArea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            error={!!error}
            rows={rows}
            {...props}
          />
        );
      default:
        return (
          <Input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            error={!!error}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;