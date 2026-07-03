import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
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
import { UpsertAlertLocationDto } from './dto/upsert-alert-location.dto';
import { LocationsService } from './locations.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('alerts/:alertId')
  @ApiOperation({
    summary: 'Récupérer la localisation d’une alerte',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID de l’alerte',
  })
  @ApiResponse({
    status: 200,
    description: 'Localisation récupérée avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit à cette localisation',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerte ou localisation introuvable',
  })
  getAlertLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('alertId', ParseUUIDPipe) alertId: string,
  ) {
    return this.locationsService.getAlertLocation(user.id, alertId);
  }

  @Put('alerts/:alertId')
  @ApiOperation({
    summary: 'Créer ou mettre à jour la localisation d’une alerte',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID de l’alerte',
  })
  @ApiResponse({
    status: 200,
    description: 'Localisation créée ou mise à jour avec succès',
  })
  @ApiResponse({
    status: 403,
    description:
      'Seul le propriétaire de l’alerte peut modifier la localisation',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerte introuvable',
  })
  upsertAlertLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('alertId', ParseUUIDPipe) alertId: string,
    @Body() upsertAlertLocationDto: UpsertAlertLocationDto,
  ) {
    return this.locationsService.upsertAlertLocation(
      user.id,
      alertId,
      upsertAlertLocationDto,
    );
  }
}
