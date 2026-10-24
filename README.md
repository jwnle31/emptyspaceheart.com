# emptyspaceheart.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/1195f150-84b6-491a-bff8-1f2b87be512e/deploy-status)](https://app.netlify.com/sites/emptyspaceheart/deploys)

<img src="./src/assets/gifs/emptyspaceheart.gif" height="48">&thinsp;&thinsp;![Tools Used](https://skillicons.dev/icons?i=react,netlify&theme=light)

emptyspaceheart.com is a minimalist hub for [Celeste](https://www.celestegame.com).

If you come across any useful resources missing from the website, please feel free to open an issue.

## Localization

The header's EN / 한국어 toggle changes the language without changing the URL.
The choice is saved in local storage. English is the default on a new visit.

Homepage copy is in `src/i18n/home.ts`, and shared footer copy is in
`src/i18n/common.ts`. Both are typed against the supported locales. To translate
another page, put its copy in a page-specific translation file and use
`useLocale()` from `src/i18n/locale.ts` to select it. Resource names and URLs
in `src/data/links.json` are proper names and stay the same across languages.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
