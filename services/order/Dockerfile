## build stage

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src

## Production stage 
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV = production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/src ./src

RUN addgroup -g 1001 nodejs && adduser -S nodeapp -u 1001 -G nodejs

USER nodeapp

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"


CMD ["node", "src/server.js"]