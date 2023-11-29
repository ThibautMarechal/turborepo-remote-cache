declare module 's3-blob-store' {
  import type { AbstractBlobStore } from 'abstract-blob-store';
  import type { S3 } from '@aws-sdk/client-s3';
  export default function (options: { client: S3; bucket: string }): AbstractBlobStore;
}
