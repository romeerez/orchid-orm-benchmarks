import { createBaseTable, orchidORM } from 'orchid-orm';
import { config, poolSize } from '../config';
import { columnTypes } from 'pqb';

const Model = createBaseTable({
  columnTypes: {
    ...columnTypes,
    text: () => columnTypes.text(0, Infinity),
    timestamp: () => columnTypes.timestamp().asDate(),
  },
});

export type UserRecord = UserModel['columns']['type'];
class UserModel extends Model {
  readonly table = 'user';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    email: t.text().unique(),
    firstName: t.text(),
    lastName: t.text(),
    bio: t.text(),
    age: t.integer(),
    city: t.text(),
    country: t.text(),
    ...t.timestamps(),
  }));
}

export type PostRecord = PostModel['columns']['type'];
class PostModel extends Model {
  readonly table = 'post';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id'),
    title: t.text(),
    description: t.text(),
    ...t.timestamps(),
  }));

  relations = {
    author: this.belongsTo(() => UserModel, {
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    postTags: this.hasMany(() => PostTagModel, {
      primaryKey: 'id',
      foreignKey: 'postId',
    }),

    tags: this.hasMany(() => TagModel, {
      through: 'postTags',
      source: 'tag',
    }),

    comments: this.hasMany(() => CommentModel, {
      primaryKey: 'id',
      foreignKey: 'postId',
    }),
  };
}

export type TagRecord = TagModel['columns']['type'];
class TagModel extends Model {
  readonly table = 'tag';
  noPrimaryKey = true;
  columns = this.setColumns((t) => ({
    name: t.text().primaryKey(),
  }));
}

export type PostTagRecord = PostTagModel['columns']['type'];
class PostTagModel extends Model {
  readonly table = 'postTag';
  columns = this.setColumns((t) => ({
    postId: t.integer().foreignKey('post', 'id'),
    tagName: t.text().foreignKey('tag', 'name'),
    ...t.primaryKey(['postId', 'tagName']),
  }));

  relations = {
    tag: this.belongsTo(() => TagModel, {
      primaryKey: 'name',
      foreignKey: 'tagName',
    }),
  };
}

export type CommentRecord = CommentModel['columns']['type'];
class CommentModel extends Model {
  readonly table = 'comment';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id'),
    postId: t.integer().foreignKey('post', 'id'),
    text: t.text(),
    ...t.timestamps(),
  }));

  relations = {
    author: this.belongsTo(() => UserModel, {
      primaryKey: 'id',
      foreignKey: 'userId',
    }),
  };
}

export const db = orchidORM(
  {
    databaseURL: config.databaseUrl,
    max: poolSize,
    min: poolSize,
  },
  {
    user: UserModel,
    post: PostModel,
    tag: TagModel,
    postTag: PostTagModel,
    comment: CommentModel,
  }
);
