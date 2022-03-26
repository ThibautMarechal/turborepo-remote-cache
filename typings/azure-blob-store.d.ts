declare module 'azure-blob-store' {
  import type { AbstractBlobStore } from 'abstract-blob-store';

  export default function (options: { accountName: string; accountKey: string; container: string }): AbstractBlobStore;
}
