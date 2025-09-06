'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('calving_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      animal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'farm_animals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      farm_id: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      lactation_number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      parity_number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      calving_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      calving_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      total_calves: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      calves_gender_status: {
        type: Sequelize.JSON,
        allowNull: true
      },
      start_milk_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('calving_history');
  }
};
