import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Schema-carrying metatype: a class (or object) that exposes a static `zodSchema`.
 * Lets handlers declare a DTO whose contract travels with the type, validated by
 * the global pipe with no per-parameter wiring.
 */
interface SchemaCarrier {
  zodSchema?: ZodSchema<unknown>;
}

/**
 * Global Zod validation pipe.
 *
 * Registered app-wide in main.ts so every boundary is covered by default
 * (ENGINEERING.md: "validate at every boundary with Zod"). It validates an
 * argument only when its metatype carries a `zodSchema` (otherwise it passes the
 * value through untouched — primitives, and params validated by an explicit
 * `new ZodValidationPipe(schema)`, are left alone).
 *
 * This gives belt-and-suspenders coverage without forcing every route to repeat
 * a schema: declare it once on the DTO, or bind explicitly where a route needs a
 * one-off shape.
 */
@Injectable()
export class GlobalZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const schema = this.schemaFor(metadata);
    if (!schema) {
      return value;
    }

    const result = schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    throw new BadRequestException({
      message: 'Validation failed.',
      errors: this.formatIssues(result.error),
    });
  }

  private schemaFor(metadata: ArgumentMetadata): ZodSchema<unknown> | undefined {
    const metatype = metadata.metatype as SchemaCarrier | undefined;
    return metatype?.zodSchema;
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
