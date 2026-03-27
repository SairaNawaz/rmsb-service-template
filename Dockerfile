# ─────────────────────────────────────────────────────────
# Dockerfile — replace with your own implementation
#
# Requirements:
#   - Expose PORT (default 3000)
#   - Connect to Postgres using DB_* env vars
#   - Serve your frontend statically (if applicable)
#
# Example stacks: Node.js, Python/FastAPI, Go, Java/Spring
#
# Default: serves public/index.html as a health check page.
# Replace with your own stack when ready.
# ─────────────────────────────────────────────────────────

# If your service has a Vite frontend, pass VITE_BASE_PATH as a build arg:
#   ARG VITE_BASE_PATH=/
#   ENV VITE_BASE_PATH=$VITE_BASE_PATH
#   RUN npm run build

FROM nginx:alpine

COPY public/ /usr/share/nginx/html/

EXPOSE 80
