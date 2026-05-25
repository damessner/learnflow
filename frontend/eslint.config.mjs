import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
 {
   ignores: [
     'dist/**',
     'node_modules/**',
     'coverage/**',
     'src/views/AdminDashboard.vue',
     'src/views/TeacherDashboard.vue',
   ],
 },
 ...pluginVue.configs['flat/recommended'],
 ...tseslint.configs.recommended,
 {
   files: ['**/*.vue'],
   languageOptions: {
     parserOptions: {
       parser: tseslint.parser,
       ecmaVersion: 2022,
       sourceType: 'module',
       extraFileExtensions: ['.vue'],
     },
   },
   rules: {
     'vue/multi-word-component-names': 'off',
     'vue/require-default-prop': 'off',
     'vue/no-v-html': 'off',
     'vue/attributes-order': 'off',
   },
 },
 {
   files: ['**/*.js', '**/*.ts'],
   languageOptions: {
     parser: tseslint.parser,
     parserOptions: {
       ecmaVersion: 2022,
       sourceType: 'module',
     },
   },
   rules: {
     '@typescript-eslint/no-unused-vars': [
       'warn',
       {
         argsIgnorePattern: '^_',
         varsIgnorePattern: '^_',
         caughtErrorsIgnorePattern: '^_',
       },
     ],
     'no-unused-vars': 'off',
     'no-undef': 'off',
   },
 },
 prettier,
)
