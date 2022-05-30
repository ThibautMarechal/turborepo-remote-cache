# base node image
FROM node:16-bullseye-slim as base

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /app

ADD package.json yarn.lock ./
RUN yarn install

# Setup production node_modules
FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json yarn.lock ./
RUN yarn install --production

# Build the app
FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ENV NODE_ENV production
COPY . .
RUN yarn prisma generate
RUN yarn build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/app /app/app
COPY --from=build /app/package.json /app/package.json

CMD ["yarn", "start"]