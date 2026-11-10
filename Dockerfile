# EduSmart web image (Nuxt SSR).
#   docker build --build-arg NUXT_PUBLIC_API_BASE_URL=https://example.com/api -t edusmart-web .
# NUXT_PUBLIC_API_BASE_URL can also be set when the container starts; Nuxt reads it at runtime.

FROM node:24-bookworm-slim AS build
WORKDIR /app
# Whole source before `npm ci`: its postinstall runs `nuxt prepare`, which scans app/.
COPY . .
RUN npm ci
ARG NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
ENV NUXT_PUBLIC_API_BASE_URL=${NUXT_PUBLIC_API_BASE_URL}
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
