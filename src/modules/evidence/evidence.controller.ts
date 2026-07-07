import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EvidenceService } from './evidence.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post('alerts/:alertId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads', 'evidence');

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          callback(null, uploadPath);
        },
        filename: (_req, file, callback) => {
          const fileExtension = extname(file.originalname);
          const fileName = `${randomUUID()}${fileExtension}`;

          callback(null, fileName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const isAudio = file.mimetype.startsWith('audio/');
        const isVideo = file.mimetype.startsWith('video/');

        if (!isAudio && !isVideo) {
          return callback(
            new BadRequestException(
              'Seuls les fichiers audio et vidéo sont autorisés',
            ),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({
    summary: 'Ajouter une preuve audio ou vidéo à une alerte',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID de l’alerte',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Preuve ajoutée avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Fichier invalide',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerte introuvable',
  })
  uploadEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('alertId', ParseUUIDPipe) alertId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.evidenceService.uploadEvidence(user.id, alertId, file);
  }

  @Get('alerts/:alertId')
  @ApiOperation({
    summary: 'Récupérer les preuves d’une alerte',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID de l’alerte',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des preuves récupérée avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerte introuvable',
  })
  getAlertEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('alertId', ParseUUIDPipe) alertId: string,
  ) {
    return this.evidenceService.getAlertEvidence(user.id, alertId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer une preuve par ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la preuve',
  })
  @ApiResponse({
    status: 200,
    description: 'Preuve récupérée avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit',
  })
  @ApiResponse({
    status: 404,
    description: 'Preuve introuvable',
  })
  getEvidenceById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.evidenceService.getEvidenceById(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une preuve',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la preuve',
  })
  @ApiResponse({
    status: 200,
    description: 'Preuve supprimée avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit',
  })
  @ApiResponse({
    status: 404,
    description: 'Preuve introuvable',
  })
  deleteEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.evidenceService.deleteEvidence(user.id, id);
  }
}
