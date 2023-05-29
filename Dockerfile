FROM node:current AS base

ARG NODE_ENV=production
ARG DATABASE_URL

ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=3000

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma migrate deploy

FROM base AS prod
RUN npm run build
CMD ["npm", "start"]

FROM base AS develop
CMD ["npm", "run", "dev"]
