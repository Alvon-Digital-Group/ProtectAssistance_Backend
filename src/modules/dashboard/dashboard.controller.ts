import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('protected-profiles')
  @ApiOperation({
    summary: 'Récupérer les profils protégés liés au membre famille',
  })
  getLinkedProtectedProfiles(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getLinkedProtectedProfiles(user.id);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Récupérer les alertes visibles dans le dashboard famille',
  })
  getDashboardAlerts(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getDashboardAlerts(user.id);
  }

  @Get('alerts/:id')
  @ApiOperation({ summary: 'Récupérer une alerte dashboard par ID' })
  @ApiParam({ name: 'id', description: 'ID de l’alerte' })
  getDashboardAlertById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dashboardService.getDashboardAlertById(user.id, id);
  }
}
