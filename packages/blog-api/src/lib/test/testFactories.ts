import { ormFactory } from 'orchid-orm-test-factory';
import { db } from '../../db';

export const factory = ormFactory(db);
