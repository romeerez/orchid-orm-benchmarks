import { Model } from '../../lib/model';
import { modelToZod } from 'porm-schema-to-zod';

export class UserModel extends Model {
  table = 'user';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    username: t.text().unique().min(3).max(30),
    email: t.text().unique().email().max(100),
    password: t.text().min(8).max(100),
    ...t.timestamps(),
  }));
}

export const userSchema = modelToZod(UserModel);
