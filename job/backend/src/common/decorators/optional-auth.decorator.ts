import { applyDecorators, UseGuards } from '@nestjs/common';
import { Public } from './public.decorator';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';

/**
 * Route is reachable without a token, but if a valid Bearer token IS sent,
 * request.user gets populated so the handler can branch on it.
 */
export const OptionalAuth = () => applyDecorators(Public(), UseGuards(OptionalJwtAuthGuard));
