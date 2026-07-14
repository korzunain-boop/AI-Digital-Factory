import type { StorageLocation } from '../objects/ids.js';

/**
 * Blob write request. Bytes are represented as an opaque base64 string
 * so Domain stays free of Node Buffer / filesystem / fetch types.
 * Infrastructure may accept richer types behind its adapter — this port stays pure.
 */
export interface StoragePutInput {
  readonly key: string;
  readonly mediaType: string;
  /** Opaque content encoding; prefer base64 for contract stability. */
  readonly contentBase64: string;
}

/**
 * Storage provider port: persist/retrieve blobs and packages.
 * Returns stable URIs/paths (StorageLocation) for Jobs.
 * No filesystem APIs in this contract.
 */
export interface StorageProvider {
  put(input: StoragePutInput): Promise<StorageLocation>;

  /**
   * Resolve whether a location exists / is readable.
   */
  exists(location: StorageLocation): Promise<boolean>;

  /**
   * Read content as base64 for packaging/QA that needs bytes without FS coupling.
   */
  getBase64(location: StorageLocation): Promise<string>;
}
