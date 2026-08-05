import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer mes notifications' })
  getMyNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getMyNotifications(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification par ID' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  getNotificationById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.getNotificationById(user.id, id);
  }

  @Post('alerts/:alertId/send-pending')
  @ApiOperation({ summary: 'Envoyer les notifications PENDING d’une alerte' })
  @ApiParam({ name: 'alertId', description: 'ID de l’alerte' })
  sendPendingNotificationsForAlert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('alertId', ParseUUIDPipe) alertId: string,
  ) {
    return this.notificationsService.sendPendingNotificationsForAlert(
      alertId,
      user.id,
    );
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Envoyer une notification push par ID' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  sendNotification(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.sendNotification(id);
  }
}
