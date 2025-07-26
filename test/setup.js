// Test setup file
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MOCK_MODE = 'true';
process.env.LOG_LEVEL = 'error';
process.env.DATA_ROOT = './test/data';
process.env.STORAGE_PATH = './test/data/storage';

// Silence console output during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;

console.log = (...args) => {
    if (process.env.TEST_VERBOSE) {
        originalConsoleLog(...args);
    }
};

console.info = (...args) => {
    if (process.env.TEST_VERBOSE) {
        originalConsoleInfo(...args);
    }
};
