const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');

const State = sequelize.define('State', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'states',
  timestamps: true
});

module.exports = State;
