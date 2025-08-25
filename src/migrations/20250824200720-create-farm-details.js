'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE, DECIMAL, ENUM } = Sequelize;

    await queryInterface.createTable('farm_details', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      // Now mandatory (non-null) FK
      fdo_emp_id: {
        type: STRING(50),
        allowNull: false,
        references: { model: 'fdo_accounts', key: 'emp_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      farm_id: {
        type: STRING(50),
        allowNull: false,
        unique: true
      },

      // A. Organizational Information
      farm_status: {
        type: ENUM('ACTIVE', 'INACTIVE', 'PIPELINE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },

      // B. Farm Information
      farmer_contact_number: {
        type: STRING(15),
        allowNull: false
      },
      // 1/3 allowed null
      alternate_phone_number: {
        type: STRING(15),
        allowNull: true
      },
      farm_name: {
        type: STRING(150),
        allowNull: false
      },
      procurement_model: {
        type: ENUM('A', 'B', 'C', 'D'),
        allowNull: false
      },

      // C. Farmer Profile
      salutation: {
        type: ENUM('Mr.', 'Mrs.', 'Smt.', 'Miss'),
        allowNull: false
      },
      farmer_name: {
        type: STRING(120),
        allowNull: false
      },
      // 2/3 allowed null
      father_parent_name: {
        type: STRING(120),
        allowNull: true
      },
      gender: {
        type: ENUM('Male', 'Female', 'Other'),
        allowNull: false
      },
      date_of_birth: {
        type: DATE,
        allowNull: false
      },

      // E. Address and Location
      latitude: {
        type: DECIMAL(10, 7),
        allowNull: false
      },
      longitude: {
        type: DECIMAL(10, 7),
        allowNull: false
      },
      address_line1: {
        type: STRING(200),
        allowNull: false
      },
      // 3/3 allowed null
      address_line2: {
        type: STRING(200),
        allowNull: true
      },
      landmark: {
        type: STRING(120),
        allowNull: false
      },
      pin_code: {
        type: STRING(6),
        allowNull: false
      },
      village_city: {
        type: STRING(120),
        allowNull: false
      },
      tehsil: {
        type: STRING(120),
        allowNull: false
      },
      district: {
        type: STRING(120),
        allowNull: false
      },
      country: {
        type: STRING(80),
        allowNull: false,
        defaultValue: 'India'
      },
      state: {
        type: STRING(100),
        allowNull: false,
        defaultValue: 'Karnataka'
      },

      // F. Service Personnel Information
      fdo_name: {
        type: STRING(120),
        allowNull: false
      },
      fdo_phone_number: {
        type: STRING(15),
        allowNull: false
      },
      inseminator_name: {
        type: STRING(120),
        allowNull: false
      },
      inseminator_contact_number: {
        type: STRING(15),
        allowNull: false
      },
      veterinarian_name: {
        type: STRING(120),
        allowNull: false
      },
      veterinarian_contact_number: {
        type: STRING(15),
        allowNull: false
      },

      // Timestamps
      createdAt: {
        type: DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('farm_details', ['farm_status']);
    await queryInterface.addIndex('farm_details', ['district']);
    await queryInterface.addIndex('farm_details', ['fdo_emp_id']);
    await queryInterface.addIndex('farm_details', ['farmer_contact_number']);
    await queryInterface.addIndex('farm_details', ['pin_code']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('farm_details');
  }
};
