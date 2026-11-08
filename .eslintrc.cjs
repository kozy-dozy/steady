/* eslint-disable no-undef */
const path = require('path')

module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier', // this already turns off formatting-conflicting rules
    ],
    plugins: ['react-refresh'],
    settings: {
        react: { version: 'detect' },

        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },

        'import/resolver': {
            typescript: {
                project: path.join(__dirname, 'react/tsconfig.eslint.json'),
                alwaysTryTypes: true,
            },
            alias: {
                map: [['@', path.join(__dirname, 'react/src')]],
                extensions: ['.ts', '.tsx', '.js', '.jsx'],
            },
        },
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        // Keep no-unused-vars at error strictness, but don't flag props that are
        // intentionally destructured out so they aren't spread via `...rest` onto
        // DOM elements (the omit-from-rest idiom used across the UI primitives).
        // `_`-prefixed bindings are also exempt for the same intent-to-discard.
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                ignoreRestSiblings: true,
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',

        'import/first': 'warn',
        'import/default': 'off',
        'import/newline-after-import': 'warn',
        'import/no-named-as-default-member': 'off',
        'import/no-named-as-default': 'off',
        'import/no-duplicates': 'error',

        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'object',
                    'type',
                ],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],

        'react/jsx-sort-props': [
            'warn',
            {
                callbacksLast: true,
                shorthandFirst: true,
                ignoreCase: true,
                reservedFirst: true,
                noSortAlphabetically: true,
            },
        ],
    },
    ignorePatterns: ['node_modules/', 'dist/', 'build/', '.turbo/', '.next/'],
}
