import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: 'supabase-env-inject',
      config() {
        return {
          define: {
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://nixykpnemupvcyjincri.supabase.co'),
            'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peHlrcG5lbXVwdmN5amluY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTM0MDIsImV4cCI6MjA4NjcyOTQwMn0.iUBEzJPF_jN2HmlvY5qowBrVoylnu3Qy8IVl2WB2cuQ'),
            'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify('nixykpnemupvcyjincri'),
          },
        };
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));