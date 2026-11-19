import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps every successful response in a small, predictable envelope:
 *   { success: true, data: <handler return value> }
 * Leaves anything the handler already shaped like `{ message, ... }` intact
 * by merging rather than nesting, so existing `message` fields still surface
 * at the top level (matches the central auth API's response style).
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return { success: true, ...data };
        }
        return { success: true, data };
      }),
    );
  }
}
