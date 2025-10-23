import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * User model for authentication
 *
 * IMPORTANT: passwordHash is stored in the database but NEVER exposed through GraphQL
 * The @ObjectType decorator is applied at the class level, but passwordHash field
 * does NOT have @Field() decorator, so it won't appear in the GraphQL schema
 */
@ObjectType()
@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @Field(() => ID)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  // NO @Field() decorator - this field is NOT exposed in GraphQL
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare passwordHash: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare firstName: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Field()
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Field()
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
