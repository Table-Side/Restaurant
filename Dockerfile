FROM --platform=linux/amd64 node:latest AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --silent --frozen-lockfile

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY .env ./.env

RUN yarn build

FROM builder AS production

EXPOSE 3000
ENTRYPOINT yarn start:migrate
