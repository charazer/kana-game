import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [
  // TypeScript files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports'
      }],
      
      // Code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }]
    }
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'src/coverage/**',
      '*.config.js',
      '*.config.ts'
    ]
  },

  // Prettier compatibility
  prettier
]
