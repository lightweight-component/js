import { getQueryParam, MyButton, HtmlEditor } from './src/index';

// Test the imports
console.log('Testing imports...');
const test = getQueryParam('test', false);
console.log('getQueryParam imported successfully:', typeof getQueryParam === 'function');
console.log('MyButton imported successfully:', typeof MyButton === 'object');
console.log('HtmlEditor imported successfully:', typeof HtmlEditor === 'object');
