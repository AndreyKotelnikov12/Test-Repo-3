import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This base path is configured for GitHub Pages deployment.
  // It is derived from the 'name' field in your package.json.
  // If your repository name is different, you might need to update this.
  base: '/rpg-inventory-system/',
})