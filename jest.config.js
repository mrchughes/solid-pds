module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: [
        '**/test/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    testTimeout: 30000
};
