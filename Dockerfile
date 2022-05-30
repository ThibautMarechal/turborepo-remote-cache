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

ENV NODE_ENV="production"
# Postgres configuration
ENV DATABASE_URL=

# Admin configuration
ENV ADMIN_USERNAME=
ENV ADMIN_EMAIL=
ENV ADMIN_PASSWORD=

# Secret
ENV COOKIE_SECRET=
ENV COOKIE_NOT_SECURE=

# Storage configuration
ENV STORAGE_TYPE=
# fs (File Storage)
ENV STORAGE_FS_PATH=
# s3 (Amazon S3)
ENV STORAGE_S3_ACCESS_KEY_ID=
ENV STORAGE_S3_SECRET_ACCESS_KEY=
ENV STORAGE_S3_FORCE_PATH_STYLE=
ENV STORAGE_S3_ENDPOINT=
ENV STORAGE_S3_REGION=
ENV STORAGE_S3_SSL_ENABLED=
ENV STORAGE_S3_BUCKET=
# azure (Azure blob storage)
ENV STORAGE_AZURE_STORAGE_ACCOUNT=
ENV STORAGE_AZURE_STORAGE_ACCESS_KEY=
ENV STORAGE_AZURE_STORAGE_CONTAINER=

CMD ["yarn", "start"]