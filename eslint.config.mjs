import globals from "globals"
import pluginJs from "@eslint/js"

/** @type {import('eslint').Linter.Config[]} */
export default [
   { ignores: ["jest.config.js"] },
   { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
   { languageOptions: { globals: globals.browser } },
   pluginJs.configs.recommended,
   {
      languageOptions: {
         globals: {
            ...globals.jest,
            ...globals.node,
         },
      },
   },
]
