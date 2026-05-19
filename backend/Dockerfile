FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]
