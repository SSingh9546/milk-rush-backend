const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FarmAnimal = require('./FarmAnimals');

const CalvingHistory = sequelize.define('CalvingHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  animal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'farm_animals',
      key: 'id'
    }
  },
  farm_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lactation_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  parity_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  calving_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  calving_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  total_calves: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  calves_gender_status: {
    type: DataTypes.JSON,
    allowNull: true
  },
  start_milk_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_current: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'calving_history',
  timestamps: true
});

// Associations
FarmAnimal.hasMany(CalvingHistory, {
  foreignKey: 'animal_id',
  as: 'calvingHistory'
});

CalvingHistory.belongsTo(FarmAnimal, {
  foreignKey: 'animal_id',
  as: 'animal'
});

module.exports = CalvingHistory;
