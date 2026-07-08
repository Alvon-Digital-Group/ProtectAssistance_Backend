import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EvidenceType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { STORAGE_SERVICE, StorageService } from '../storage/storage.types';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
  ) {}

  private readonly evidenceInclude = {
    alert: {
      include: {
        location: true,
        protectedProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    },
  } satisfies Prisma.EvidenceInclude;

  private async getAlertWithProtectedProfile(alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id: alertId,
      },
      include: {
        protectedProfile: true,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    return alert;
  }

  private async canViewEvidence(userId: string, protectedUserId: string) {
    if (userId === protectedUserId) {
      return true;
    }

    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        protectedUserId_familyUserId: {
          protectedUserId,
          familyUserId: userId,
        },
      },
    });

    return !!familyLink;
  }

  private getEvidenceTypeFromMimeType(mimeType: string) {
    if (mimeType.startsWith('audio/')) {
      return EvidenceType.AUDIO;
    }

    if (mimeType.startsWith('video/')) {
      return EvidenceType.VIDEO;
    }

    throw new BadRequestException(
      'Seuls les fichiers audio et vidéo sont autorisés',
    );
  }

  async uploadEvidence(
    userId: string,
    alertId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier envoyé');
    }

    const alert = await this.getAlertWithProtectedProfile(alertId);

    const isOwner = alert.protectedProfile.userId === userId;

    if (!isOwner) {
      throw new ForbiddenException(
        'Seul l’utilisateur protégé peut ajouter une preuve à son alerte',
      );
    }

    const evidenceType = this.getEvidenceTypeFromMimeType(file.mimetype);

    const storedFile = await this.storageService.uploadEvidenceFile(file);

    return this.prisma.evidence.create({
      data: {
        alertId: alert.id,
        type: evidenceType,
        fileUrl: storedFile.url,
        mimeType: storedFile.mimeType,
        size: storedFile.size,
        storageProvider: storedFile.provider,
        storageKey: storedFile.key,
      },
      include: this.evidenceInclude,
    });
  }

  async getAlertEvidence(userId: string, alertId: string) {
    const alert = await this.getAlertWithProtectedProfile(alertId);

    const isAllowed = await this.canViewEvidence(
      userId,
      alert.protectedProfile.userId,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à consulter les preuves de cette alerte',
      );
    }

    return this.prisma.evidence.findMany({
      where: {
        alertId: alert.id,
      },
      include: this.evidenceInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getEvidenceById(userId: string, evidenceId: string) {
    const evidence = await this.prisma.evidence.findUnique({
      where: {
        id: evidenceId,
      },
      include: this.evidenceInclude,
    });

    if (!evidence) {
      throw new NotFoundException('Preuve introuvable');
    }

    const isAllowed = await this.canViewEvidence(
      userId,
      evidence.alert.protectedProfile.userId,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à consulter cette preuve',
      );
    }

    return evidence;
  }

  async deleteEvidence(userId: string, evidenceId: string) {
    const evidence = await this.prisma.evidence.findUnique({
      where: {
        id: evidenceId,
      },
      include: this.evidenceInclude,
    });

    if (!evidence) {
      throw new NotFoundException('Preuve introuvable');
    }

    const isOwner = evidence.alert.protectedProfile.userId === userId;

    if (!isOwner) {
      throw new ForbiddenException(
        'Seul l’utilisateur protégé peut supprimer cette preuve',
      );
    }

    await this.prisma.evidence.delete({
      where: {
        id: evidenceId,
      },
    });

    if (evidence.storageKey) {
      await this.storageService.deleteFile(evidence.storageKey);
    }

    return {
      message: 'Preuve supprimée avec succès',
    };
  }
}
