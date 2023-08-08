import { createBaseTable } from 'orchid-orm';
import { columnTypes } from 'pqb';
import { zodSchemaProvider } from 'orchid-orm-schema-to-zod';

export const BaseTable = createBaseTable({
  columnTypes: {
    ...columnTypes,
    text: (min = 3, max = 100) => columnTypes.text(min, max),
    timestamp: () => columnTypes.timestamp().asNumber(),
  },
  schemaProvider: zodSchemaProvider,
});
