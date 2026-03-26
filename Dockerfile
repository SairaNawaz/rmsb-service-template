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
FROM node:20-alpine

WORKDIR /app

EXPOSE 3000

CMD ["node", "src/index.js"]
