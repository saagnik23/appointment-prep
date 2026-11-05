import '@testing-library/jest-dom';

// Polyfill window.print if not present
if (typeof window.print !== 'function') {
  window.print = () => {};
}

