import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface DateInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, ...props }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // Handle both YYYY-MM-DD and DD/MM/YYYY formats
    if (dateStr.includes('-')) {
      // YYYY-MM-DD format
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } else if (dateStr.includes('/')) {
      // Already in DD/MM/YYYY format
      return dateStr;
    }
    
    return dateStr;
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for form submission
  const formatForSubmit = (displayStr: string): string => {
    if (!displayStr) return '';
    
    // Remove any non-digit and non-slash characters
    const cleaned = displayStr.replace(/[^\d/]/g, '');
    
    // Handle DD/MM/YYYY format
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      
      // Validate and pad values
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      
      // Basic validation
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum >= 1 && dayNum <= 31 && 
          monthNum >= 1 && monthNum <= 12 && 
          yearNum >= 1900 && yearNum <= 2100) {
        return `${year}-${paddedMonth}-${paddedDay}`;
      }
    }
    
    return '';
  };

  // Initialize display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    let formatted = input;

    // Auto-format as user types: DD/MM/YYYY
    const digitsOnly = input.replace(/\D/g, '');
    
    if (digitsOnly.length >= 1) {
      if (digitsOnly.length <= 2) {
        formatted = digitsOnly;
      } else if (digitsOnly.length <= 4) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      } else if (digitsOnly.length <= 8) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
      } else {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
      }
    }

    setDisplayValue(formatted);

    // Convert to YYYY-MM-DD format for onChange callback
    const submitValue = formatForSubmit(formatted);
    onChange(submitValue);
  };

  const handleBlur = () => {
    // Reformat on blur to ensure consistent formatting
    const submitValue = formatForSubmit(displayValue);
    if (submitValue) {
      setDisplayValue(formatForDisplay(submitValue));
    } else if (displayValue.trim() !== '') {
      // If input is not empty but invalid, show error by keeping the input as is
      // You could also clear it or show a validation message
    }
  };

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="DD/MM/YYYY"
      inputProps={{
        ...props.inputProps,
        maxLength: 10,
      }}
    />
  );
};

export default DateInput;