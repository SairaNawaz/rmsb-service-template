# ─────────────────────────────────────────────────────────
# Dockerfile — replace with your own implementation
#
# Requirements:
#   - Listen on PORT 3000 (gateway routes to this port)
#   - Connect to Postgres using DB_* env vars
#   - Serve your frontend at /
#
# Example stacks: Node.js, Python/FastAPI, Go, Java/Spring
#
# If your service has a Vite frontend, pass VITE_BASE_PATH as a build arg:
#   ARG VITE_BASE_PATH=/
#   ENV VITE_BASE_PATH=$VITE_BASE_PATH
#   RUN npm run build
# ─────────────────────────────────────────────────────────

# Default: serves a health check page with a live DB connection test on port 3000.
# Replace with your own stack when ready.

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "server.js"]
