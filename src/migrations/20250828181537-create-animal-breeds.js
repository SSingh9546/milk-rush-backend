'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('animal_breeds', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cow_breed: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      buffalo_breed: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('animal_breeds');
  }
};
