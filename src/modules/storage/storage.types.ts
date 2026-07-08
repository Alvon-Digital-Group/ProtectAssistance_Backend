export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export type StorageProviderName = 'local' | 'cloudinary';

export type StoredFile = {
  url: string;
  key: string;
  provider: StorageProviderName;
  mimeType: string;
  size: number;
};

export interface StorageService {
  uploadEvidenceFile(file: Express.Multer.File): Promise<StoredFile>;
  deleteFile(key: string): Promise<void>;
}
