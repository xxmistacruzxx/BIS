FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm i

FROM base as runner
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV PORT 3000
EXPOSE 3000

CMD ["npm", "start"]