import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { StoredFile, StorageService } from './storage.types';

export class CloudinaryStorageService implements StorageService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or use STORAGE_PROVIDER=local.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadEvidenceFile(file: Express.Multer.File): Promise<StoredFile> {
    if (!file.buffer) {
      throw new InternalServerErrorException('Fichier invalide');
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'protect-assistance/evidence',
          public_id: randomUUID(),
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve(uploadResult);
        },
      );

      uploadStream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      key: result.public_id,
      provider: 'cloudinary',
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(key: string): Promise<void> {
    if (!key) {
      return;
    }

    await cloudinary.uploader.destroy(key, {
      resource_type: 'video',
    });
  }
}
