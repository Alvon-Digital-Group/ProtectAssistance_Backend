import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Vérifier l’état du backend' })
  check() {
    return {
      status: 'ok',
      service: 'protect-assistance-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
