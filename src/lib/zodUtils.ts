import {
  AnyZodObject,
  ZodArray,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodTuple,
  ZodTypeAny,
} from 'zod';

export const deepStrict = <T extends ZodTypeAny>(
  schema: T
): T extends AnyZodObject ? ZodObject<T['shape'], 'strict'> : T => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (schema instanceof ZodObject) {
    schema._def.unknownKeys = 'strict';
    const newShape: Record<string, unknown> = {};

    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepStrict(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape,
    }) as any;
  } else if (schema instanceof ZodArray) {
    return ZodArray.create(deepStrict(schema.element)) as any;
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepStrict(schema.unwrap())) as any;
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepStrict(schema.unwrap())) as any;
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(
      schema.items.map((item: any) => deepStrict(item))
    ) as any;
  } else {
    return schema as any;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
