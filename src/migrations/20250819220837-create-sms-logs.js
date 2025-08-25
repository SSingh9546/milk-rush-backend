'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sms_logs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      // FK to logged_in_farmers.id
      farmer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'logged_in_farmers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      msg_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      otp: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      temp_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      comment_log: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('sms_logs');
  }
};
