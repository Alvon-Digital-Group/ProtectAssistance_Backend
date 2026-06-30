import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionLevel } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateFamilyLinkDto } from './dto/create-family-link.dto';
import { UpdateFamilyLinkDto } from './dto/update-family-link.dto';

@Injectable()
export class FamilyLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async createFamilyLink(
    protectedUserId: string,
    createFamilyLinkDto: CreateFamilyLinkDto,
  ) {
    const familyUser = await this.prisma.user.findUnique({
      where: {
        email: createFamilyLinkDto.familyUserEmail,
      },
    });

    if (!familyUser) {
      throw new NotFoundException(
        'Aucun utilisateur trouvé avec cet email famille',
      );
    }

    if (familyUser.id === protectedUserId) {
      throw new BadRequestException(
        'Un utilisateur ne peut pas être lié à lui-même',
      );
    }

    const existingLink = await this.prisma.familyLink.findUnique({
      where: {
        protectedUserId_familyUserId: {
          protectedUserId,
          familyUserId: familyUser.id,
        },
      },
    });

    if (existingLink) {
      throw new ConflictException(
        'Ce membre famille est déjà lié à cet utilisateur',
      );
    }

    return this.prisma.familyLink.create({
      data: {
        protectedUserId,
        familyUserId: familyUser.id,
        relationship: createFamilyLinkDto.relationship,
        permissionLevel:
          createFamilyLinkDto.permissionLevel ?? PermissionLevel.RECEIVE_ALERTS,
      },
      include: {
        protectedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        familyUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async getLinksAsProtectedUser(protectedUserId: string) {
    return this.prisma.familyLink.findMany({
      where: {
        protectedUserId,
      },
      include: {
        familyUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLinksAsFamilyMember(familyUserId: string) {
    return this.prisma.familyLink.findMany({
      where: {
        familyUserId,
      },
      include: {
        protectedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateFamilyLink(
    currentUserId: string,
    familyLinkId: string,
    updateFamilyLinkDto: UpdateFamilyLinkDto,
  ) {
    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        id: familyLinkId,
      },
    });

    if (!familyLink) {
      throw new NotFoundException('Lien familial introuvable');
    }

    if (familyLink.protectedUserId !== currentUserId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres liens familiaux',
      );
    }

    return this.prisma.familyLink.update({
      where: {
        id: familyLinkId,
      },
      data: {
        relationship: updateFamilyLinkDto.relationship,
        permissionLevel: updateFamilyLinkDto.permissionLevel,
      },
      include: {
        familyUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async deleteFamilyLink(currentUserId: string, familyLinkId: string) {
    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        id: familyLinkId,
      },
    });

    if (!familyLink) {
      throw new NotFoundException('Lien familial introuvable');
    }

    if (familyLink.protectedUserId !== currentUserId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres liens familiaux',
      );
    }

    await this.prisma.familyLink.delete({
      where: {
        id: familyLinkId,
      },
    });

    return {
      message: 'Lien familial supprimé avec succès',
    };
  }
}
