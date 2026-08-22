# ── Stage 1: Build frontend ─────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend (TypeScript → dist/) ─────────────────────────────
FROM node:20-alpine AS backend-builder

# git + ssh required for GitHub-sourced dependencies (mysql-baileys)
RUN apk add --no-cache git openssh-client

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY backend/ ./backend/
RUN npx tsc -p backend

# ── Stage 3: Production image ────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache git openssh-client

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 3030

CMD ["node", "./dist/index.js"]
