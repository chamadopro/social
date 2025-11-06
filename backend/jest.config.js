/**
 * ============================================================================
 * SISTEMA CHAMADOPRO
 * ============================================================================
 * 
 * Autor Intelectual do sistema: Alexandro Trova
 * Propriedade do cÃ³digo: Alexandro Trova
 * 
 * Desenvolvido em colaboraÃ§Ã£o com execuÃ§Ã£o de partes do cÃ³digo 
 * como orientado pelo Autor.
 * 
 * Data de criaÃ§Ã£o: 24/10/2025
 * 
 * ============================================================================
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

