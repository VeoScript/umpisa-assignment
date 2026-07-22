FROM node:22-slim AS base
WORKDIR /app

# System deps needed by Prisma's OpenSSL detection
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
