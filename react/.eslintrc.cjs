/* eslint-disable no-undef */
const path = require('path')

module.exports = {
    root: true,
    extends: ['../.eslintrc.cjs', 'plugin:jsx-a11y/recommended'],
    settings: {
        'import/resolver': {
            typescript: {
                project: path.join(__dirname, 'tsconfig.eslint.json'),
                alwaysTryTypes: true,
            },
            alias: {
                map: [
                    ['@', path.join(__dirname, 'src')],
                    ['@shared', path.resolve(__dirname, '../shared')],
                ],
                extensions: ['.ts', '.tsx', '.js', '.jsx'],
            },
        },
    },
}
