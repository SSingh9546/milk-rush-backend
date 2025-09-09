const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const CalvingHistory = require('./CalvingHistory');
const InseminationHistory = require('./InseminationHistory');

const PregnancyHistory = sequelize.define('PregnancyHistory', {
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
  insemination_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'insemination_history',
      key: 'id'
    }
  },
  pd_check_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  pd_check_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  pregnancy_result: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  done_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  insemination_outcome: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dry_off_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estimated_dry_off_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'pregnancy_history',
  timestamps: true,
  indexes: [
    { fields: ['calving_id'] },
    { fields: ['insemination_id'] }
  ]
});

// Associations
CalvingHistory.hasMany(PregnancyHistory, {
  foreignKey: 'calving_id',
  as: 'pregnancies'
});

PregnancyHistory.belongsTo(CalvingHistory, {
  foreignKey: 'calving_id',
  as: 'calving'
});

InseminationHistory.hasMany(PregnancyHistory, {
  foreignKey: 'insemination_id',
  as: 'pregnancies'
});

PregnancyHistory.belongsTo(InseminationHistory, {
  foreignKey: 'insemination_id',
  as: 'insemination'
});

module.exports = PregnancyHistory;
