# Stage 1: Build frontend
FROM node:26-alpine AS frontend
ENV CI=true
RUN npm install -g pnpm@11.15.1
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml frontend/.npmrc ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm run build

# Stage 2: Build backend native deps
FROM node:26-alpine AS backend
ENV CI=true
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@11.15.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Final
FROM node:26-alpine
RUN apk add --no-cache su-exec
WORKDIR /app
COPY --from=backend /app/node_modules ./node_modules
COPY server.js ./
COPY lib/ ./lib/
COPY routes/ ./routes/
COPY --from=frontend /app/public ./public
COPY public/locales ./public/locales
COPY scripts/seed-data.mjs ./scripts/seed-data.mjs
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh && mkdir -p data
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3100/api/auth/config || exit 1
CMD ["sh", "entrypoint.sh"]
