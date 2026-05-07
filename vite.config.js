import { defineConfig } from "vite";
import { compileString } from "squint-cljs/node-api.js";

function squintPlugin() {
  return {
    name: "squint-cljs",
    async transform(code, id) {
      if (!id.endsWith(".cljs")) return null;
      const result = await compileString(code);
      return { code: result.javascript, map: null };
    },
  };
}

export default defineConfig({
  plugins: [squintPlugin()],
  resolve: {
    extensions: [".cljs", ".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: ["@codemirror/state", "@codemirror/view", "@codemirror/commands"],
  },
  test: {
    environment: "happy-dom",
  },
});
