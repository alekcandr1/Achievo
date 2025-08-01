import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Achievo/',

  // define: { // Добавляем переменные окружения
  //   'import.meta.env.PUBLIC_URL': JSON.stringify('/Achievo/')
  // },
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },
})
