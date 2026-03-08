# ── Stage 1: Build frontend ─────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install git + ssh (required for GitHub-sourced dependencies: mysql-baileys, libsignal-node)
RUN apk add --no-cache git openssh-client

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend (both .js and supporting files)
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Directory for temporary file uploads (xlsx, etc.)
RUN mkdir -p backend/files

EXPOSE 4000

CMD ["node", "./backend/index.js"]
