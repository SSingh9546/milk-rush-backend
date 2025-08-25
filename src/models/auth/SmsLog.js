const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const LoggedInFarmer = require('./LoggedInFarmer');

const SmsLog = sequelize.define('SmsLog', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  // FK to logged_in_farmers.id
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  msg_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  temp_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  comment_log: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sms_logs',
  timestamps: true
});

/** Associations
 * sms_logs.farmer_id -> logged_in_farmers.id
 */
SmsLog.belongsTo(LoggedInFarmer, {
  foreignKey: 'farmer_id',
  as: 'loggedInFarmer'
});
LoggedInFarmer.hasMany(SmsLog, {
  foreignKey: 'farmer_id',
  as: 'smsLogs'
});

module.exports = SmsLog;
