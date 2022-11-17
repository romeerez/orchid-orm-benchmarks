import { createModel } from 'porm';
import { columnTypes } from 'pqb';

export const Model = createModel({
  columnTypes: {
    ...columnTypes,
    timestamp: () => columnTypes.timestamp().asNumber(),
  },
});
