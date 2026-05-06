import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["@codemirror/state", "@codemirror/view", "@codemirror/commands"],
  },
});
