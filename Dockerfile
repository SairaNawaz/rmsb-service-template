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

# Default: serves public/index.html as a health check page on port 3000.
# Replace with your own stack when ready.

FROM nginx:alpine

COPY public/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
