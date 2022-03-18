module.exports = {
    'env': {
        'es2021': true,
        'node': true,
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'sourceType': 'module',
        'ecmaVersion': 13,
    },
    'rules': {
        'max-len': ['error', {
            'code': 120,
            'ignoreTemplateLiterals': true,
            'ignoreRegExpLiterals': true,
        }],
        'indent': ['error', 4, {
            'SwitchCase': 1,
        }],
        'quotes': ['error', 'single'],
        'semi': ['error', 'never'],
        'curly': ['error'],
        'keyword-spacing': ['error'],
        'no-multiple-empty-lines': ['error'],
        'no-unused-vars': ['error', {
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_'
        }],
        'dot-location': ['error', 'property'],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'new-parens': 'error',
        'eqeqeq': 'error',
        'no-var': 'error',
        'no-promise-executor-return': 'error',
        'no-template-curly-in-string': 'error',
        'no-constructor-return': 'error',
        'no-useless-constructor': 'error',
        'no-eq-null': 'error',
        'no-invalid-this': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-lonely-if': 'error',
        'no-else-return': 'error',
        'no-unused-expressions': 'error',
        'no-multi-spaces': 'error',
        'no-duplicate-imports': ['error'],
        'consistent-return': ['error'],
        'default-case-last': 'error',
        'func-call-spacing': ['error', 'never'],
        'camelcase': ['error'],
        'yoda': 'error',
        'prefer-template': 'error',
        'class-methods-use-this': ['warn', {
            'exceptMethods': [],
        }],
    },
    'ignorePatterns': [
        'dist',
        'examples',
        'tests',
        'documentation',
        '*.gushio.js'
    ],
}
