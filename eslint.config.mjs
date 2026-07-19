import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // eslint-config-next 16 bundles eslint-plugin-react-hooks 7, which adds
            // new React Compiler rules. The existing codebase predates them, so we
            // surface them as warnings instead of hard errors to avoid blocking CI
            // on pre-existing patterns. Address these incrementally, then promote
            // back to "error".
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/purity': 'warn',
            'react-hooks/refs': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
            'react-hooks/globals': 'warn',
        },
    },
    globalIgnores(['.next/', 'out/', 'build/', 'node_modules/', 'next-env.d.ts']),
])
