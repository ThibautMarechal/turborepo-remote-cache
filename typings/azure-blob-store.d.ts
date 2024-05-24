declare module 'azure-blob-store' {
  import type { AbstractBlobStore } from 'abstract-blob-store';
  function blobStore(options: { accountName: string; accountKey: string; container: string }): AbstractBlobStore;
  export default { default: blobStore };
}
