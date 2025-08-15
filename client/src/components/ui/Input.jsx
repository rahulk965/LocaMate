import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  
  const classes = [
    baseClasses,
    sizes[size],
    stateClasses,
    fullWidth ? 'w-full' : '',
    icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={classes}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
