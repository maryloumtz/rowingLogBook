FROM node:22.14.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22.14.0-alpine AS builder
WORKDIR /app
ARG API_BASE_URL=http://backend:8080
ARG API_PROXY_TARGET=http://backend:8080
ENV API_BASE_URL=$API_BASE_URL
ENV API_PROXY_TARGET=$API_PROXY_TARGET
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22.14.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ARG API_BASE_URL=http://backend:8080
ARG API_PROXY_TARGET=http://backend:8080
ENV API_BASE_URL=$API_BASE_URL
ENV API_PROXY_TARGET=$API_PROXY_TARGET
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
