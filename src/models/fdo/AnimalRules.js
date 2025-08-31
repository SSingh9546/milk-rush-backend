const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');

const AnimalRule = sequelize.define('AnimalRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  is_inseminated: {
    type: DataTypes.ENUM('Yes', 'No', 'N/A'),
    allowNull: false,
    defaultValue: 'N/A'
  },
  is_pregnant: {
    type: DataTypes.ENUM('Yes', 'No', 'N/A'),
    allowNull: false,
    defaultValue: 'N/A'
  },
  calving_number: {
    type: DataTypes.ENUM('N/A', '0', '≥1'),
    allowNull: false,
    defaultValue: 'N/A',
    comment: 'Allowed values: N/A, 0, ≥1'
  },
  is_dry: {
    type: DataTypes.ENUM('Yes', 'No', 'N/A'),
    allowNull: false,
    defaultValue: 'N/A'
  },
  pdr: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'N/A'
  },
  lactation_status: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  breeding_status: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  physiological_stage: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lactation_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'rule expression, e.g. LN = CN'
  },
  parity_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'rule expression, e.g. PN = LN or PN = LN + 1'
  },
  rule_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'animal_rules',
  timestamps: false
});

module.exports = AnimalRule;
