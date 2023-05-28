FROM node:current-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS build
RUN npm run build
CMD ["./node_modules/.bin/remix-serve", "build"]

FROM base AS develop
CMD ["npm", "run", "dev"]
