/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/apps/server/src', '<rootDir>/packages/shared/src'],
    moduleNameMapper: {
        '^@7wonders/shared$': '<rootDir>/packages/shared/src/index',
        '^@7wonders/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    },
    testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                esModuleInterop: true,
                module: 'commonjs',
                moduleResolution: 'node',
                resolveJsonModule: true,
                strict: true,
                target: 'ES2022',
            },
        }],
    },
};
