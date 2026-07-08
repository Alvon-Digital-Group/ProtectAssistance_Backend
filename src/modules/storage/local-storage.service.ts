import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { StoredFile, StorageService } from './storage.types';

export class LocalStorageService implements StorageService {
  async uploadEvidenceFile(file: Express.Multer.File): Promise<StoredFile> {
    const uploadPath = join(process.cwd(), 'uploads', 'evidence');

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    const fileExtension = extname(file.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const localPath = join(uploadPath, fileName);

    writeFileSync(localPath, file.buffer);

    return {
      url: `/uploads/evidence/${fileName}`,
      key: `evidence/${fileName}`,
      provider: 'local',
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const cleanKey = key.startsWith('/uploads/')
      ? key.replace(/^\/uploads\//, '')
      : key;

    const localPath = join(process.cwd(), 'uploads', cleanKey);

    if (existsSync(localPath)) {
      unlinkSync(localPath);
    }
  }
}
