import { createModel, orchidORM } from 'orchid-orm';
import { config } from '../config';
import { columnTypes } from 'pqb';

const Model = createModel({
  columnTypes: {
    ...columnTypes,
    text: () => columnTypes.text(0, Infinity),
    timestamp: () => columnTypes.timestamp().asDate(),
  },
});

export type UserRecord = UserModel['columns']['type'];
class UserModel extends Model {
  table = 'user';
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
  table = 'post';
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
  table = 'tag';
  columns = this.setColumns((t) => ({
    name: t.text().primaryKey(),
  }));
}

export type PostTagRecord = PostTagModel['columns']['type'];
class PostTagModel extends Model {
  table = 'postTag';
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
  table = 'comment';
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
    connectionString: config.databaseUrl,
  },
  {
    user: UserModel,
    post: PostModel,
    tag: TagModel,
    postTag: PostTagModel,
    comment: CommentModel,
  }
);
