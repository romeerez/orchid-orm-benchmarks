import { createModel } from 'orchid-orm';
import { columnTypes } from 'pqb';

export const Model = createModel({
  columnTypes: {
    ...columnTypes,
    timestamp: () => columnTypes.timestamp().asNumber(),
  },
});
