import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une alerte' })
  @ApiResponse({
    status: 201,
    description: 'Alerte créée avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil protégé introuvable',
  })
  createAlert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createAlertDto: CreateAlertDto,
  ) {
    return this.alertsService.createAlert(user.id, createAlertDto);
  }
}
