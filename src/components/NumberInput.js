import React from 'react';
import { Plus, Minus } from 'lucide-react';

const NumberInput = ({ value, onChange, step = 0.1, min = 0, max = Infinity }) => {
  const handleIncrement = () => {
    const newValue = Math.min(parseFloat(value || 0) + step, max);
    onChange(newValue.toFixed(2));
  };

  const handleDecrement = () => {
    const newValue = Math.max(parseFloat(value || 0) - step, min);
    onChange(newValue.toFixed(2));
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleDecrement}
        className="px-2 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="w-20 px-2 py-1 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="px-2 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NumberInput;

