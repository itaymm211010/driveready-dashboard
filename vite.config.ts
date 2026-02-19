import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback to hardcoded values if loadEnv fails (Lovable Cloud issue)
  const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://nixykpnemupvcyjincri.supabase.co';
  const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peHlrcG5lbXVwdmN5amluY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTM0MDIsImV4cCI6MjA4NjcyOTQwMn0.iUBEzJPF_jN2HmlvY5qowBrVoylnu3Qy8IVl2WB2cuQ';
  const SUPABASE_PROJECT = env.VITE_SUPABASE_PROJECT_ID || 'nixykpnemupvcyjincri';

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(SUPABASE_KEY),
      'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(SUPABASE_PROJECT),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});