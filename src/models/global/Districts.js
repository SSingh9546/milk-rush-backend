const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const State = require('./States');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'states',
      key: 'id'
    }
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'districts',
  timestamps: true
});

// Associations
State.hasMany(District, {
  foreignKey: 'state_id',
  as: 'districts'
});

District.belongsTo(State, {
  foreignKey: 'state_id',
  as: 'state'
});

module.exports = District;
