'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('animal_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      is_inseminated: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        defaultValue: 'N/A',
        allowNull: false
      },
      is_pregnant: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        defaultValue: 'N/A',
        allowNull: false
      },
      calving_number: {
        type: Sequelize.ENUM('N/A', '0', '≥1'),
        allowNull: false,
        defaultValue: 'N/A'
      },
      is_dry: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        defaultValue: 'N/A',
        allowNull: false
      },
      pdr: {
        type: Sequelize.STRING(50),
        defaultValue: 'N/A',
        allowNull: false
      },
      lactation_status: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      breeding_status: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      physiological_stage: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      lactation_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'expression, e.g. LN = CN'
      },
      parity_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'expression, e.g. PN = LN or PN = LN + 1'
      },
      rule_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('animal_rules');
  }
};
