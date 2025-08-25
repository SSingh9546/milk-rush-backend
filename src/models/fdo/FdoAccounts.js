const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FarmerData = require('../farmer/FarmerData');

const FdoAccount = sequelize.define('FdoAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  emp_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fdo_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  assigned_farm_id: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['new', 'replace', 'replaced']],
    }
  },
  is_login: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'fdo_accounts',
  timestamps: true
});

/**
 * Associations
 * fdo_accounts.assigned_farm_id -> farmer_data.farm_id
 */
FdoAccount.belongsTo(FarmerData, {
  foreignKey: 'assigned_farm_id',
  targetKey: 'farm_id',
  as: 'farm'
});

FarmerData.hasMany(FdoAccount, {
  foreignKey: 'assigned_farm_id',
  sourceKey: 'farm_id',
  as: 'fdoAccounts'
});

module.exports = FdoAccount;
