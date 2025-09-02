'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('animal_bio_details', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      farm_animal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'farm_animals', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_inseminated: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      is_pregnant: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      calving_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      insemination_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      insemination_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      insemination_count: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sire_details: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      pd_check_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pd_check_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      pregnancy_result: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      done_by: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      previous_insemination_outcome: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      estimated_calving_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      estimated_dry_off_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_animal_dry: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      date_of_dry: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pregnancy_check_notes: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      last_calving_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      calving_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      is_placenta_retained: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      total_calves_in_latest_calving: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      days_in_milk: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      previous_days_in_milk: {
        type: Sequelize.INTEGER,
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('animal_bio_details');
  }
};
