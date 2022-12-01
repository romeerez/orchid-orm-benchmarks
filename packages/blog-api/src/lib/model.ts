import { createModel } from 'orchid-orm';
import { columnTypes } from 'pqb';

export const Model = createModel({
  columnTypes: {
    ...columnTypes,
    text: (min = 3, max = 100) => columnTypes.text(min, max),
    timestamp: () => columnTypes.timestamp().asNumber(),
  },
});
