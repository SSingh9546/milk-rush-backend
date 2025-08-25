const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');

const FarmerData = sequelize.define('FarmerData', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true
  },
  farm_id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  farm_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  farmer_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'farmer_data',
  timestamps: true
});

module.exports = FarmerData;
