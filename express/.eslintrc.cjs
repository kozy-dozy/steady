/* eslint-disable no-undef */
module.exports = {
    root: true,
    extends: ['../.eslintrc.cjs'],
    overrides: [
        {
            files: ['src/index.ts', 'src/server.ts'],
            rules: {
                'import/order': 'off',
                'import/first': 'off',
                'import/newline-after-import': 'off',
            },
        },
    ],
}