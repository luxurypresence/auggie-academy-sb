import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Lead } from './lead.model';

export enum TaskSource {
  MANUAL = 'manual',
  AI_SUGGESTED = 'ai_suggested',
  DISMISSED = 'dismissed',
}

// Register the enum for GraphQL
registerEnumType(TaskSource, {
  name: 'TaskSource',
  description:
    'Source of the task (manual creation, AI suggestion, or dismissed)',
});

@ObjectType()
@Table({
  tableName: 'tasks',
  timestamps: true,
})
export class Task extends Model<Task> {
  @Field(() => ID)
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare dueDate: Date;

  @Field()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare completed: boolean;

  @Field(() => TaskSource)
  @Column({
    type: DataType.ENUM(...Object.values(TaskSource)),
    allowNull: false,
    defaultValue: TaskSource.MANUAL,
  })
  declare source: TaskSource;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare aiReasoning: string;

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

  @Field()
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
