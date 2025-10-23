import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Lead } from './lead.model';

export enum NotificationType {
  LEAD_CREATED = 'lead_created',
  TASK_COMPLETED = 'task_completed',
  SCORE_UPDATED = 'score_updated',
  COMMENT_ADDED = 'comment_added',
}

// Register enum for GraphQL
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
@Table({
  tableName: 'notifications',
  timestamps: true,
})
export class Notification extends Model<Notification> {
  @Field(() => ID)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Field(() => NotificationType)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  declare type: NotificationType;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Field()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare message: string;

  @Field()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isRead: boolean;

  @Field(() => Int, { nullable: true })
  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare relatedLeadId: number | null;

  @Field(() => Lead, { nullable: true })
  @BelongsTo(() => Lead)
  relatedLead?: Lead;

  @Field()
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Field()
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
