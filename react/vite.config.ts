import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        'babel-plugin-styled-components'
      ]
    }
  }),
  dynamicImport()],
  assetsInclude: ['**/*.md'],
  resolve: {
    // @kozy-dozy/* resolve from node_modules (published to GitHub Packages) and
    // declare react/styled-components as PEER deps. Dedupe forces a single copy
    // of each so hooks/context/theme work across the package boundary.
    alias: [
      // Runtime values (enums/labels) are imported from shared/dtos, so Vite
      // must resolve @shared the same way tsconfig `paths` does.
      { find: '@shared', replacement: path.join(__dirname, '..', 'shared') },
      { find: '@', replacement: path.join(__dirname, 'src') },
    ],
    dedupe: ['react', 'react-dom', 'styled-components', 'react-redux', '@reduxjs/toolkit', 'redux'],
  },
  build: {
    outDir: 'build'
  }
});
