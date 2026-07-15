import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer mon abonnement' })
  getMySubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getOrCreateMySubscription(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Mettre à jour mon abonnement' })
  updateMySubscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateMySubscription(user.id, dto);
  }
}
