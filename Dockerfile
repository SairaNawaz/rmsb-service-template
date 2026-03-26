# ─────────────────────────────────────────────────────────
# Dockerfile — replace with your own implementation
#
# Requirements:
#   - Expose PORT (default 3000)
#   - Connect to Postgres using DB_* env vars
#   - Serve your frontend statically (if applicable)
#
# Example stacks: Node.js, Python/FastAPI, Go, Java/Spring
# ─────────────────────────────────────────────────────────

# TODO: replace with your stack
# If your service has a frontend built with Vite, pass VITE_BASE_PATH as a build arg:
#   ARG VITE_BASE_PATH=/
#   ENV VITE_BASE_PATH=$VITE_BASE_PATH
#   RUN npm run build  (uses process.env.VITE_BASE_PATH in vite.config)
FROM node:20-alpine

WORKDIR /app

EXPOSE 3000

CMD ["node", "src/index.js"]
