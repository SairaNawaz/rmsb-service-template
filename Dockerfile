# ── Stage 1: Build React frontend ──────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# TODO: update VITE_SERVICE_BASE to match your service's path_prefix (e.g. /s2)
ARG VITE_SERVICE_BASE=/svc
ENV VITE_SERVICE_BASE=$VITE_SERVICE_BASE
RUN npm run build

# ── Stage 2: API server + serve built frontend ──────────────
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/dist ./public

# TODO: update port if needed
EXPOSE 3001

CMD ["node", "src/index.js"]
