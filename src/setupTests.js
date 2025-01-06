import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import * as React from 'react';

// Override the default act from @testing-library/react
configure({ asyncUtilTimeout: 5000 });

// Explicitly set the global act to use React.act
global.act = React.act;

// Suppress specific console warnings
const originalError = console.error;
console.error = (...args) => {
  if (args[0].includes('Warning: ReactDOM.render is no longer supported in React 18')) {
    return;
  }
  if (args[0].includes('Warning: An update to Component inside a test was not wrapped in act')) {
    return;
  }
  if (args[0].includes('Warning: `ReactDOMTestUtils.act` is deprecated')) {
    return;
  }
  originalError.apply(console, args);
};

