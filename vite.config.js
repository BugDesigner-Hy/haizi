import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        blog: resolve("blog/index.html"),
        post: resolve("blog/post.html"),
        photos: resolve("photos/index.html"),
      },
    },
  },
});
