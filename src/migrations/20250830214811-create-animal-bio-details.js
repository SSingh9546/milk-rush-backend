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
        allowNull: true
      },
      insemination_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      insemination_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      insemination_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      insemination_done_by: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      insemination_count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sire_details: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      is_pregnant: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      pd_check_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      pd_check_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      pregnancy_result: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pregnancy_done_by: {
        type: Sequelize.STRING(120),
        allowNull: true
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
        allowNull: true
      },
      date_of_dry: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      pregnancy_check_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      calving_number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      last_calving_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      calving_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      is_placenta_retained: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      total_calves_in_latest_calving: {
        type: Sequelize.INTEGER,
        allowNull: true
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
