import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Lead } from './lead.model';

export enum InteractionType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
}

// Register the enum for GraphQL
registerEnumType(InteractionType, {
  name: 'InteractionType',
  description: 'Type of interaction with a lead',
});

@ObjectType()
@Table({
  tableName: 'interactions',
  timestamps: true,
  updatedAt: false,
})
export class Interaction extends Model<Interaction> {
  @Field(() => ID)
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Field(() => InteractionType)
  @Column({
    type: DataType.ENUM(...Object.values(InteractionType)),
    allowNull: false,
  })
  declare type: InteractionType;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string;

  @Field(() => Int)
  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare leadId: number;

  @Field(() => Lead, { nullable: true })
  @BelongsTo(() => Lead)
  lead?: Lead;

  @Field()
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;
}
