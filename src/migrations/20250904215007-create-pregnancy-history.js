'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pregnancy_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      calving_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'calving_history',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pd_check_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pd_check_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      pregnancy_result: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      done_by: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      insemination_outcome: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      estimated_dry_off_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      dry_off_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pregnancy_history');
  }
};
