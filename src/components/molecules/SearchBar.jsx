import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";

const SearchBar = ({ 
  placeholder = 'Search tasks...', 
  onSearch, 
  className = '',
  showAdvancedOptions = false,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    searchFields: ['title', 'description', 'project'],
    fuzzyEnabled: false,
    fuzzyThreshold: 0.6
  });

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch?.('');
  };
const handleOptionChange = (option, value) => {
    setSearchOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleFieldToggle = (field) => {
    setSearchOptions(prev => ({
      ...prev,
      searchFields: prev.searchFields.includes(field)
        ? prev.searchFields.filter(f => f !== field)
        : [...prev.searchFields, field]
    }));
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name="Search" size={20} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            className={`pl-10 ${searchTerm ? 'pr-10' : 'pr-4'} ${showAdvancedOptions ? 'pr-20' : ''}`}
            {...props}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <ApperIcon name="X" size={20} />
            </button>
          )}
        </div>
        
        {showAdvancedOptions && (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-200 ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-500'
            }`}
            title="Advanced search options"
          >
            <ApperIcon name="SlidersHorizontal" size={20} />
          </button>
        )}
      </div>
      
      {showFilters && showAdvancedOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search In
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'title', label: 'Title' },
                  { value: 'description', label: 'Description' },
                  { value: 'project', label: 'Project' }
                ].map(field => (
                  <button
                    key={field.value}
                    type="button"
                    onClick={() => handleFieldToggle(field.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      searchOptions.searchFields.includes(field.value)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={searchOptions.fuzzyEnabled}
                  onChange={(e) => handleOptionChange('fuzzyEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable fuzzy matching (typo tolerance)</span>
              </label>
            </div>
            
            {searchOptions.fuzzyEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuzzy Match Sensitivity
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.9"
                  step="0.1"
                  value={searchOptions.fuzzyThreshold}
                  onChange={(e) => handleOptionChange('fuzzyThreshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>More permissive</span>
                  <span>More strict</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;