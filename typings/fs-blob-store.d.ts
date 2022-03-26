declare module 'fs-blob-store' {
  import type { AbstractBlobStore } from 'abstract-blob-store';
  export default function (basePath: string): AbstractBlobStore;
}
