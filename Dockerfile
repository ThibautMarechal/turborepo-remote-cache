# base node image
FROM node:20-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json yarn.lock ./
RUN yarn install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json yarn.lock ./
RUN yarn install --production

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN yarn build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/server /myapp/server
COPY --from=build /myapp/public /myapp/public
ADD . .

# Postgres configuration
ENV DATABASE_URL=

# Admin configuration
ENV ADMIN_USERNAME=
ENV ADMIN_EMAIL=
ENV ADMIN_PASSWORD=

# Cookie
ENV COOKIE_SECRET=

# Only use "true" when not deployed over https
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
