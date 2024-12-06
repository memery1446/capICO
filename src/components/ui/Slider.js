import React from 'react';

export const Slider = ({ min, max, value, onValueChange, step = 1, disabled = false, className = '' }) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onValueChange([newValue]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value[0]}
      onChange={handleChange}
      step={step}
      disabled={disabled}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    />
  );
};

export default Slider;

