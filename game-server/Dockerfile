FROM node:22-alpine as builder

WORKDIR /game-server

COPY game-server/package.json game-server/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY game-server ./

RUN yarn build

FROM node:18-alpine as production

WORKDIR /game-server

COPY --from=builder /game-server/package.json /game-server/yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /game-server/dist /game-server/dist

EXPOSE 6767

# Step 10: Start the game server
CMD ["yarn", "start"]
