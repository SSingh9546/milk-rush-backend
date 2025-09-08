'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('farm_animals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      farm_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'farm_details',
          key: 'farm_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dam_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      registration_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pedometer_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      origin: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      dam_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      dam_breed_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sire_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sire_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sire_breed_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      animal_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      type_of_birth: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      born_status: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      species: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      breed: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      bcs: {
        type: Sequelize.DECIMAL(3,2),
        allowNull: true
      },
      livestock_status: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      lactation_status: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      breeding_status: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      lactation_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      physiological_stage: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      parity_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      is_calf: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      is_adult: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },      
      is_animal: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    await queryInterface.addIndex('farm_animals', ['farm_id']);
    await queryInterface.addIndex('farm_animals', ['species']);
    await queryInterface.addIndex('farm_animals', ['breed']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('farm_animals');
  }
};
