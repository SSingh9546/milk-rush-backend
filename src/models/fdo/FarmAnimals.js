const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FarmDetail = require('./FarmDetails');

const FarmAnimal = sequelize.define('FarmAnimal', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  farm_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'farm_details',
      key: 'farm_id'
    }
  },
  dam_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  registration_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pedometer_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  origin: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dam_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dam_breed_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sire_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sire_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sire_breed_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  animal_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type_of_birth: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  species: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  breed: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bcs: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  livestock_status: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lactation_status: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  breeding_status: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lactation_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  physiological_stage: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  parity_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  born_status: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_calf: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  is_animal: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
}, {
  tableName: 'farm_animals',
  timestamps: true
});

// Associations
FarmAnimal.belongsTo(FarmDetail, {
  foreignKey: 'farm_id',
  targetKey: 'farm_id',
  as: 'farm'
});

module.exports = FarmAnimal;
