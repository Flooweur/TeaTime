# TeaTime's image (SPEC §3.7): the server, serving the built app, in one container. The build
# context is the repo root, since the npm workspaces share one lockfile. `npm run daily:up` builds it.

# 1. The build: every workspace compiled, the app included.
FROM node:22.23.4-slim AS build
# better-sqlite3 is compiled when no prebuilt binary fits.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json app-version.json ./
COPY packages/core/package.json packages/core/
COPY content/package.json content/
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci
COPY packages/core packages/core
COPY content content
COPY backend backend
COPY frontend frontend
RUN npm run build

# 2. The server's dependencies only, built for this image's Node.
FROM node:22.23.4-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY content/package.json content/
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev --workspace backend --include-workspace-root=false && npm cache clean --force

# 3. The image: the compiled workspaces, the server's dependencies, the migrations and the app.
FROM node:22.23.4-slim
# The owner's time zone is a setting (SPEC §3.7); the container's clock reads UTC.
ENV NODE_ENV=production TZ=UTC HOST=0.0.0.0 PORT=3200 DATABASE_PATH=/data/teatime.sqlite STATIC_DIR=/app/frontend/dist
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY package.json app-version.json ./
COPY packages/core/package.json packages/core/
COPY content/package.json content/
COPY backend/package.json backend/
COPY --from=build /app/packages/core/dist packages/core/dist
COPY --from=build /app/content/dist content/dist
COPY --from=build /app/backend/dist backend/dist
COPY backend/drizzle backend/drizzle
COPY --from=build /app/frontend/dist frontend/dist
# The database's volume and the backups' bind mount: a new volume takes the app user as owner.
RUN mkdir -p /data /backups && chown node:node /data /backups
USER node
WORKDIR /app/backend
EXPOSE 3200
CMD ["node", "dist/src/server.js"]
