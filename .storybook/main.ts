import type { StorybookConfig } from "@storybook/nextjs-vite";
import { loadEnv } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  async viteFinal(config) {
    const env = loadEnv("development", process.cwd(), "NEXT_PUBLIC_");
    config.define = {
      ...config.define,
      "process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
          env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
          "",
      ),
    };
    return config;
  },
};
export default config;
