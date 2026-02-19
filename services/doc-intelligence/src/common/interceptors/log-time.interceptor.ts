import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogTimeInterceptor.name);

  constructor(private readonly label?: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const msg = `${this.label ?? context.getClass().name} executed in ${duration}ms`;

        this.logger.log(msg);

        // Добавляем заголовок
        const res = context.switchToHttp().getResponse();
        if (res?.setHeader) {
          res.setHeader('X-Execution-Time', `${duration}ms`);
        }
      }),
    );
  }
}
