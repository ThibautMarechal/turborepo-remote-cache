# Turborepo Remote cache

Self-host your [turborepo remote cache](https://turborepo.org/docs/features/remote-caching) powerred by [Remix](https://remix.run/)

- Docker image support [thibmarechal/turborepo-remote-cache](https://hub.docker.com/r/thibmarechal/turbo-epo-remote-cache)
- Can be deployed anywhere that support Remix ([How top deploy a Remix  app?](https://remix.run/docs/en/v1/guides/deployment))
- Storage provider supported:
  - fs: file storage ([example](./docker-compose.fs.yml))
  - s3: [https://aws.amazon.com/s3/](https://aws.amazon.com/s3/) ([example](./docker-compose.s3.yml))
  - azure: [https://azure.microsoft.com/en-us/services/storage/blobs/](https://azure.microsoft.com/en-us/services/storage/blobs/)

Support the the analytics API:
- Provide to you the time saved by using this remote cache !

## Configuration

### USER configuration
- ADMIN_USERNAME : admin
- ADMIN_PASWWORD : admin

### TURBO configuration

### Storage configuration
- STORAGE_TYPE : the type of storage to use (default: fs, options: fs ,s3, azure)
#### fs (File Storage)
- STORAGE_FS_PATH : the path where to storage the cache,
#### s3 (Amazon S3)
- STORAGE_S3_ACCESS_KEY_ID
- STORAGE_S3_SECRET_ACCESS_KEY
- STORAGE_S3_FORCE_PATH_STYLE
- STORAGE_S3_ENDPOINT
- STORAGE_S3_REGION
- STORAGE_S3_SSL_ENABLED
- STORAGE_S3_BUCKET
#### azure (Azure blob storage)
- STORAGE_AZURE_STORAGE_ACCOUNT
- STORAGE_AZURE_STORAGE_ACCESS_KEY
- STORAGE_AZURE_STORAGE_CONTAINER

### Postgres configuration
- DATABASE_URL

## Repository configuration

```json
//.turbo/config.json
{
  "teamId": "team_my-team",
  "apiUrl": "http://localhost:8080/turbo/api",
  "loginUrl": "http://localhost:8080/turbo/login"
}
```

## Development

From your terminal:

```sh
yarn dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
yarn build
```

Then run the app in production mode:

```sh
yarn start
```

Now you'll need to pick a host to deploy it to.

You can also use the Dockerfile
