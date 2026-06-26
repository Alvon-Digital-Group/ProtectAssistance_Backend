import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'protect-assistance-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
