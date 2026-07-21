import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userId = request.user?.id ?? 'anonymous';
    const startedAt = Date.now();

    this.logger.log(`[REQUEST] ${method} ${url} user=${userId}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(
          `[RESPONSE] ${method} ${url} ${duration}ms user=${userId}`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startedAt;
        this.logger.error(
          `[ERROR] ${method} ${url} ${duration}ms user=${userId} message=${error.message}`,
          error.stack,
        );

        return throwError(() => error);
      }),
    );
  }
}
