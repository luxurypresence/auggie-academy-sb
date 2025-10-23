import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('notifications', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          'lead_created',
          'task_completed',
          'score_updated',
          'comment_added',
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'isRead', // camelCase
      },
      relatedLeadId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'relatedLeadId', // camelCase
        references: {
          model: 'leads',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'createdAt', // camelCase
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updatedAt', // camelCase
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('notifications', ['createdAt'], {
      name: 'notifications_created_at_idx',
    });

    await queryInterface.addIndex('notifications', ['isRead'], {
      name: 'notifications_is_read_idx',
    });

    await queryInterface.addIndex('notifications', ['relatedLeadId'], {
      name: 'notifications_related_lead_id_idx',
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    // Drop indexes first
    await queryInterface.removeIndex(
      'notifications',
      'notifications_created_at_idx',
    );
    await queryInterface.removeIndex(
      'notifications',
      'notifications_is_read_idx',
    );
    await queryInterface.removeIndex(
      'notifications',
      'notifications_related_lead_id_idx',
    );

    // Drop table
    await queryInterface.dropTable('notifications');

    // Drop enum type (PostgreSQL specific)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_type";',
    );
  },
};
