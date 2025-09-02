const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FarmAnimal = require('./FarmAnimals');

const AnimalBioDetail = sequelize.define('AnimalBioDetail', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  farm_animal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'farm_animals',
      key: 'id'
    }
  },
  is_inseminated: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  is_pregnant: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  calving_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  insemination_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  insemination_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  insemination_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sire_details: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  pd_check_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  pd_check_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  pregnancy_result: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  done_by: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  previous_insemination_outcome: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  estimated_calving_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estimated_dry_off_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_animal_dry: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  date_of_dry: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  pregnancy_check_notes: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  last_calving_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  calving_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_placenta_retained: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  total_calves_in_latest_calving: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  days_in_milk: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  previous_days_in_milk: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'animal_bio_details',
  timestamps: true
});

// Associations
AnimalBioDetail.belongsTo(FarmAnimal, {
  foreignKey: 'farm_animal_id',
  as: 'animal'
});

FarmAnimal.hasMany(AnimalBioDetail, {
  foreignKey: 'farm_animal_id',
  as: 'bioDetails'
});

module.exports = AnimalBioDetail;
