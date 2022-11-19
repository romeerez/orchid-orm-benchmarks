import { DataTypes, Model, Sequelize, NOW } from 'sequelize';
import { config } from '../config';
import {
  CommentRecord,
  PostRecord,
  PostTagRecord,
  TagRecord,
  UserRecord,
} from './porm';

const db = new Sequelize(config.databaseUrl, {
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

type UserCreate = Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export class SequelizeUser
  extends Model<UserRecord, UserCreate>
  implements UserRecord
{
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  bio!: string;
  age!: number;
  city!: string;
  country!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

SequelizeUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
    },
  },
  {
    tableName: 'user',
    sequelize: db,
  }
);

type PostCreate = Omit<PostRecord, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

class SequelizePost
  extends Model<PostRecord, PostCreate>
  implements PostRecord
{
  id!: number;
  userId!: number;
  title!: string;
  description!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

SequelizePost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
    },
  },
  {
    tableName: 'post',
    sequelize: db,
  }
);

class SequelizeTag extends Model<TagRecord, TagRecord> implements TagRecord {
  name!: string;
}

SequelizeTag.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    tableName: 'tag',
    sequelize: db,
  }
);

export class SequelizePostTag
  extends Model<PostTagRecord, PostTagRecord>
  implements PostTagRecord
{
  postId!: number;
  tagName!: string;
}

SequelizePostTag.init(
  {
    postId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    tagName: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: 'postTag',
    sequelize: db,
  }
);

type CommentCreate = Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export class SequelizeComment
  extends Model<CommentRecord, CommentCreate>
  implements CommentRecord
{
  id!: number;
  userId!: number;
  postId!: number;
  text!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

SequelizeComment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
    },
  },
  {
    tableName: 'comment',
    sequelize: db,
  }
);

SequelizePost.belongsTo(SequelizeUser, {
  as: 'author',
  foreignKey: {
    name: 'userId',
  },
});

SequelizePost.hasMany(SequelizePostTag, {
  as: 'postTags',
  foreignKey: {
    name: 'postId',
  },
});

SequelizePost.hasMany(SequelizeComment, {
  as: 'comments',
  foreignKey: {
    name: 'postId',
  },
});

SequelizeComment.belongsTo(SequelizeUser, {
  as: 'author',
  foreignKey: {
    name: 'userId',
  },
});

export const sequelize = Object.assign(db, {
  user: SequelizeUser,
  post: SequelizePost,
});
