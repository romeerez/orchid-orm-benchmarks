import { createBaseTable } from 'orchid-orm';
import { zodSchemaProvider } from '../../../../../orchid-orm/packages/schema-to-zod';

export const BaseTable = createBaseTable({
  columnTypes: (t) => ({
    ...t,
    text: (min = 0, max = Infinity) => t.text(min, max),
  }),
  schemaProvider: zodSchemaProvider,
});
