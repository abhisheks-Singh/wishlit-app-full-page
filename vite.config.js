import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dns from 'node:dns';

// Set DNS result order to avoid issues with ngrok
dns.setDefaultResultOrder('verbatim');

// Install global fetch for Remix
installGlobals({ nativeFetch: true });

// Handle environment variables
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;
let hmrConfig;

if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    // Allow ngrok and other hosts
    allowedHosts: [
      host, // Existing allowed host
      '.ngrok-free.app' // Allow all subdomains of ngrok-free.app
    ],
    cors: {
      origin: '*', // Allow all origins for testing (adjust as needed)
      preflightContinue: false // Allow preflight requests to be handled normally
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"], // Allow access to these directories
    },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: false,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0, // Disable inlining of assets
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris"], // Include dependencies for optimization
  },
});
