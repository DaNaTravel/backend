import { Logger, Injectable, CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request: Request = context.switchToHttp().getRequest();

    const info = `url: ${request.url}, body: ${JSON.stringify(request.body)}, query: ${JSON.stringify(request.query)}`;

    this.logger.log(`Request ${info} start.`);
    return next.handle().pipe(tap(() => this.logger.log(`Request ${info} end.`)));
  }
}
