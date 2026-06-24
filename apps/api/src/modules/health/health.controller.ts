import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/auth/public.decorator';

interface HealthResponse {
  readonly status: 'ok';
  readonly uptimeSeconds: number;
  readonly timestamp: string;
}

/**
 * GET /health — unauthenticated liveness probe for Railway / uptime checks.
 *
 * Intentionally leaks nothing: no version, no dependency status, no config. A
 * richer readiness probe (DB/Redis reachability) can be added once those
 * clients are wired, behind its own non-public route if it exposes detail.
 */
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
