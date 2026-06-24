import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Validates a single argument against a Zod schema and returns the parsed value.
 *
 * Bound per-parameter via `new ZodValidationPipe(schema)` so each boundary
 * declares its own contract (ENGINEERING.md: "validate at every boundary with
 * Zod; never trust external data"). On failure it returns a structured 400 with
 * field-level messages — and nothing else (no stack, no internals).
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    throw new BadRequestException({
      message: 'Validation failed.',
      errors: this.formatIssues(result.error),
    });
  }

  private formatIssues(
    error: ZodError,
  ): ReadonlyArray<{ path: string; message: string }> {
    return error.issues.map((issue) => ({
      path: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
  }
}
