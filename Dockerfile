FROM node:current-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma migrate deploy

FROM base AS prod
RUN npm run build
CMD ["./node_modules/.bin/remix-serve", "build"]

FROM base AS develop
CMD ["npm", "run", "dev"]
