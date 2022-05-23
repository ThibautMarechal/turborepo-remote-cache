import type { Readable } from 'stream';
import path from 'path';
import type { AbstractBlobStore } from 'abstract-blob-store';
import type { TurboContext } from '~/types/TurboContext';
import fs from 'fs-blob-store';
import aws from 'aws-sdk';
import s3 from 's3-blob-store';
import azure from 'azure-blob-store';
import invariant from 'tiny-invariant';

export class CacheStorage {
  private blobStore: AbstractBlobStore;
  constructor() {
    const {
      STORAGE_TYPE,
      STORAGE_FS_PATH,
      STORAGE_S3_ACCESS_KEY_ID,
      STORAGE_S3_SECRET_ACCESS_KEY,
      STORAGE_S3_FORCE_PATH_STYLE,
      STORAGE_S3_ENDPOINT,
      STORAGE_S3_REGION,
      STORAGE_S3_SSL_ENABLED,
      STORAGE_S3_BUCKET,
      STORAGE_AZURE_STORAGE_ACCOUNT,
      STORAGE_AZURE_STORAGE_ACCESS_KEY,
      STORAGE_AZURE_STORAGE_CONTAINER,
    } = process.env;
    switch (STORAGE_TYPE) {
      case 'fs':
        this.blobStore = fs(STORAGE_FS_PATH ?? path.join(process.cwd(), 'data', 'fs'));
        break;
      case 's3': {
        invariant(STORAGE_S3_ACCESS_KEY_ID, 'Expected STORAGE_S3_ACCESS_KEY_ID');
        invariant(STORAGE_S3_SECRET_ACCESS_KEY, 'Expected STORAGE_S3_SECRET_ACCESS_KEY');
        const s3client = new aws.S3({
          credentials: {
            accessKeyId: STORAGE_S3_ACCESS_KEY_ID,
            secretAccessKey: STORAGE_S3_SECRET_ACCESS_KEY,
          },
          s3ForcePathStyle: Boolean(STORAGE_S3_FORCE_PATH_STYLE),
          endpoint: STORAGE_S3_ENDPOINT ? new aws.Endpoint(STORAGE_S3_ENDPOINT) : undefined,
          region: STORAGE_S3_REGION,
          sslEnabled: Boolean(STORAGE_S3_SSL_ENABLED ?? true),
        });
        this.blobStore = s3({ client: s3client, bucket: STORAGE_S3_BUCKET ?? 'turborepo-remote-cache' });
        break;
      }
      case 'azure':
        invariant(STORAGE_AZURE_STORAGE_ACCOUNT, 'Expected STORAGE_AZURE_STORAGE_ACCOUNT');
        invariant(STORAGE_AZURE_STORAGE_ACCESS_KEY, 'Expected STORAGE_AZURE_STORAGE_ACCESS_KEY');
        invariant(STORAGE_AZURE_STORAGE_CONTAINER, 'Expected STORAGE_AZURE_STORAGE_CONTAINER');
        this.blobStore = azure({
          accountName: STORAGE_AZURE_STORAGE_ACCOUNT,
          accountKey: STORAGE_AZURE_STORAGE_ACCESS_KEY,
          container: STORAGE_AZURE_STORAGE_CONTAINER,
        });
        break;
      default:
        throw new Error('Expected STORAGE_TYPE to be valid storage type (fs,s3,azure)');
    }
  }

  private getArtifactKey(turboCtx: TurboContext): string {
    invariant(turboCtx.artifactId, 'Expected artifactId');
    invariant(turboCtx.team, 'Expected team');
    return `${path.join(turboCtx.team.id, turboCtx.artifactId)}.tar.gz`;
  }

  private getCacheMetadataKey(turboCtx: TurboContext): string {
    return `${this.getArtifactKey(turboCtx)}-meta.json`;
  }

  private async read(key: string): Promise<Readable> {
    if (await this.exist(key)) {
      return this.blobStore.createReadStream(key);
    }
    throw new Error(`Key "${key}" was Not found'`);
  }

  async readArtifact(turboCtx: TurboContext): Promise<Readable> {
    return this.read(this.getArtifactKey(turboCtx));
  }

  async readMeta(turboCtx: TurboContext): Promise<Readable> {
    return this.read(this.getCacheMetadataKey(turboCtx));
  }

  private write(key: string, stream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.pipe(
        this.blobStore.createWriteStream(key, (err, metadata) => {
          if (err) {
            reject(err);
          } else if (metadata) {
            resolve();
          }
        }),
      );
    });
  }

  writeArtifact(turboCtx: TurboContext, artifactStream: Readable): Promise<void> {
    return this.write(this.getArtifactKey(turboCtx), artifactStream);
  }

  writeMeta(turboCtx: TurboContext, metaStream: Readable): Promise<void> {
    return this.write(this.getCacheMetadataKey(turboCtx), metaStream);
  }

  private exist(key: string): Promise<boolean> {
    return new Promise((resolve, reject) =>
      this.blobStore.exists(key, (err, exist) => {
        if (err) {
          reject(err);
        } else {
          resolve(exist);
        }
      }),
    );
  }

  existArtifact(turboCtx: TurboContext): Promise<boolean> {
    return this.exist(this.getArtifactKey(turboCtx));
  }

  existMeta(turboCtx: TurboContext): Promise<boolean> {
    return this.exist(this.getCacheMetadataKey(turboCtx));
  }

  private remove(key: string): Promise<void> {
    return new Promise((resolve, reject) =>
      this.blobStore.remove(key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }),
    );
  }

  removeArtifact(turboCtx: TurboContext): Promise<void> {
    return this.remove(this.getArtifactKey(turboCtx));
  }

  removeMeta(turboCtx: TurboContext): Promise<void> {
    return this.remove(this.getCacheMetadataKey(turboCtx));
  }
}
