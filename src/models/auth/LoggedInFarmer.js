const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FarmerData = require('../farmer/FarmerData');

const LoggedInFarmer = sequelize.define('LoggedInFarmer', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  farm_id: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'logged_in_farmers',
  timestamps: true
});

/** Associations
 * logged_in_farmers.farm_id -> farmer_data.farm_id
 */
LoggedInFarmer.belongsTo(FarmerData, {
  foreignKey: 'farm_id',
  targetKey: 'farm_id',
  as: 'farmerData'
});
FarmerData.hasOne(LoggedInFarmer, {
  foreignKey: 'farm_id',
  sourceKey: 'farm_id',
  as: 'loginState'
});

module.exports = LoggedInFarmer;
