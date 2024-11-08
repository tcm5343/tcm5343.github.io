import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(async () => {
  const mdx = await import('@mdx-js/rollup');

  return {
    base: "https://tcm5343.github.io/",
    plugins: [react(), mdx.default()],
  }
});