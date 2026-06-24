import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { BillingService } from './billing.service';
import {
  portalSessionSchema,
  type PortalSessionDto,
} from './billing.dto';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { Public } from '../../common/auth/public.decorator';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthContext } from '../../common/auth/auth-context';
import { RAW_BODY_KEY, type RequestWithRawBody } from './raw-body';

/**
 * Billing endpoints.
 *
 * - POST /stripe/webhook is @Public (Stripe is not a logged-in user); it
 *   authenticates by signature over the RAW body captured by the content-type
 *   parser (see raw-body.ts + main.ts).
 * - POST /billing/portal-session is authenticated and returns a Stripe Customer
 *   Portal URL.
 */
@Controller()
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Public()
  @Post('stripe/webhook')
  async webhook(
    @Req() request: FastifyRequest & RequestWithRawBody,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true; handled: boolean }> {
    const rawBody = request[RAW_BODY_KEY];
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body.');
    }
    return this.billing.handleWebhook(rawBody, signature);
  }

  @Post('billing/portal-session')
  async portalSession(
    @CurrentUser() user: AuthContext,
    @Body(new ZodValidationPipe(portalSessionSchema)) dto: PortalSessionDto,
  ): Promise<{ url: string }> {
    // Customer id is resolved server-side from the authenticated user, never
    // trusted from the client (review CRITICAL-1).
    return this.billing.createPortalSession(user, dto.returnUrl);
  }
}
