import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
@Table({
  tableName: 'leads',
  timestamps: true,
})
export class Lead extends Model<Lead> {
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
  declare firstName: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string;

  @Field(() => Float, { nullable: true })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare budget: number;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare location: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare company: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'website',
  })
  declare source: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'new',
  })
  declare status: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare summary: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare summaryGeneratedAt: Date;

  @Field(() => Int, { nullable: true })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare activityScore: number;

  @Field({ nullable: true })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare scoreCalculatedAt: Date;

  @Field()
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Field()
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Field(() => [Interaction], { nullable: true })
  @HasMany(() => Interaction, 'leadId')
  interactions: Interaction[];

  @Field(() => [Task], { nullable: true })
  @HasMany(() => Task, 'leadId')
  tasks: Task[];
}

// Import at the top level to avoid circular dependency
import { Interaction } from './interaction.model';
import { Task } from './task.model';
