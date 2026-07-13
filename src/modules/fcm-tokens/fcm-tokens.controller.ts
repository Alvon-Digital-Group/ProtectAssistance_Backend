import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpsertFcmTokenDto } from './dto/upsert-fcm-token.dto';
import { FcmTokensService } from './fcm-tokens.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('FCM Tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me/fcm-token')
export class FcmTokensController {
  constructor(private readonly fcmTokensService: FcmTokensService) {}

  @Post()
  @ApiOperation({
    summary: 'Ajouter ou mettre à jour le token FCM de l’utilisateur connecté',
  })
  upsertMyFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertFcmTokenDto,
  ) {
    return this.fcmTokensService.upsertMyFcmToken(user.id, dto);
  }
}
