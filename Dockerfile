
FROM node:22-alpine AS base
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apk add --no-cache bash curl \
  && corepack enable \
  && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

FROM base AS deps

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

FROM node:22-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN corepack enable \
  && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]