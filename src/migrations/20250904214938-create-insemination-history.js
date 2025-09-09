'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('insemination_history', {
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
      insemination_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      insemination_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      insemination_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      done_by: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      insemination_count: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('insemination_history', ['calving_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('insemination_history', ['calving_id']);
    await queryInterface.dropTable('insemination_history');
  }
};
