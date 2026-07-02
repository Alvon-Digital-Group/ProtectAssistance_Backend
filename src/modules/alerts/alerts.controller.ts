import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { GetAlertsQueryDto } from './dto/get-alerts-query.dto';

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

  @Get()
  @ApiOperation({
    summary: 'Récupérer les alertes de l’utilisateur connecté protégé',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des alertes récupérée avec succès',
  })
  getMyAlerts(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetAlertsQueryDto,
  ) {
    return this.alertsService.getMyAlerts(user.id, query);
  }

  @Get('family')
  @ApiOperation({
    summary:
      'Récupérer les alertes des utilisateurs protégés liés au membre famille connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des alertes famille récupérée avec succès',
  })
  getFamilyAlerts(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetAlertsQueryDto,
  ) {
    return this.alertsService.getFamilyAlerts(user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer une alerte par ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de l’alerte',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerte récupérée avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit à cette alerte',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerte introuvable',
  })
  getAlertById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.alertsService.getAlertById(user.id, id);
  }
}
