import { createBaseTable, orchidORM, TableType } from 'orchid-orm';
import { databaseURLs, poolSize } from '../config';

const BaseTable = createBaseTable({
  columnTypes: (t) => ({
    ...t,
    text: () => t.text(0, Infinity),
    timestamp: () => t.timestamp().asDate(),
  }),
});

export type UserRecord = TableType<UserModel>;
class UserModel extends BaseTable {
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

export type PostRecord = TableType<PostModel>;
class PostModel extends BaseTable {
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

export type TagRecord = TableType<TagModel>;
class TagModel extends BaseTable {
  readonly table = 'tag';
  noPrimaryKey = true;
  columns = this.setColumns((t) => ({
    name: t.text().primaryKey(),
  }));
}

export type PostTagRecord = TableType<PostTagModel>;
class PostTagModel extends BaseTable {
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

export type CommentRecord = TableType<CommentModel>;
class CommentModel extends BaseTable {
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
    databaseURL: databaseURLs.orchid,
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
