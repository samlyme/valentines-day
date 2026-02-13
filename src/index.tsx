import { serve } from "bun";
import index from "./index.html";

// Suppress all console errors
const originalError = console.error;
console.error = (...args: any[]) => {
  // Silently ignore errors
  return;
};

// Suppress warnings too
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  // Silently ignore warnings
  return;
};

// Handle uncaught errors globally
process.on('uncaughtException', (err) => {
  // Ignore
});

process.on('unhandledRejection', (reason, promise) => {
  // Ignore
});

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Serve static images and videos
    "/images/*": async (req) => {
      try {
        const url = new URL(req.url);
        const filePath = `./src${url.pathname}`;
        const file = Bun.file(filePath);
        
        if (await file.exists()) {
          const ext = url.pathname.split('.').pop()?.toLowerCase();
          const contentTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mov': 'video/quicktime',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg'
          };
          
          const headers: Record<string, string> = {};
          if (ext && contentTypes[ext]) {
            headers['Content-Type'] = contentTypes[ext];
          }
          
          return new Response(file, { headers });
        }
        return new Response("Not found", { status: 404 });
      } catch (e) {
        return new Response("Not found", { status: 404 });
      }
    },

    "/api/hello": {
      async GET(req) {
        try {
          return Response.json({
            message: "Hello, world!",
            method: "GET",
          });
        } catch (e) {
          return new Response("Error", { status: 500 });
        }
      },
      async PUT(req) {
        try {
          return Response.json({
            message: "Hello, world!",
            method: "PUT",
          });
        } catch (e) {
          return new Response("Error", { status: 500 });
        }
      },
    },

    "/api/hello/:name": async req => {
      try {
        const name = req.params.name;
        return Response.json({
          message: `Hello, ${name}!`,
        });
      } catch (e) {
        return new Response("Error", { status: 500 });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: false, // Disable console echo
  },
});

console.log(`🚀 Server running at ${server.url}`);
