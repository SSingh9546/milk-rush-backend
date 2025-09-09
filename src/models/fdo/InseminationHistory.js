const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const CalvingHistory = require('./CalvingHistory');

const InseminationHistory = sequelize.define('InseminationHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  calving_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'calving_history',
      key: 'id'
    }
  },
  insemination_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  insemination_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  insemination_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  done_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  insemination_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_current: {
    type: DataTypes.BOOLEAN,    
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'insemination_history',
  timestamps: true
});

// Associations
CalvingHistory.hasMany(InseminationHistory, {
  foreignKey: 'calving_id',
  as: 'inseminations'
});

InseminationHistory.belongsTo(CalvingHistory, {
  foreignKey: 'calving_id',
  as: 'calving'
});

module.exports = InseminationHistory;
