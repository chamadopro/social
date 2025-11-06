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
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
};

