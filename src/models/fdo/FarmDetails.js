const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FdoAccount = require('./FdoAccounts');

const FarmDetails = sequelize.define('FarmDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  fdo_emp_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: { model: 'fdo_accounts', key: 'emp_id' }
  },

  farm_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  farm_status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'PIPELINE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },

  farmer_contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },

  // 1/3 nullable
  alternate_phone_number: {
    type: DataTypes.STRING(15),
    allowNull: true
  },

  farm_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  procurement_model: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false
  },

  salutation: {
    type: DataTypes.ENUM('Mr.', 'Mrs.', 'Smt.', 'Miss'),
    allowNull: false
  },

  farmer_name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  // 2/3 nullable
  father_parent_name: {
    type: DataTypes.STRING(120),
    allowNull: true
  },

  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },

  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false
  },

  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },

  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },

  address_line1: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  // 3/3 nullable
  address_line2: {
    type: DataTypes.STRING(200),
    allowNull: true
  },

  landmark: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  pin_code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },

  village_city: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  tehsil: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  district: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  country: {
    type: DataTypes.STRING(80),
    allowNull: false,
    defaultValue: 'India'
  },

  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Karnataka'
  },

  fdo_name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  fdo_phone_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },

  inseminator_name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  inseminator_contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },

  veterinarian_name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },

  veterinarian_contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  }

}, {
  tableName: 'farm_details',
  timestamps: true
});

// Associations (string FK to non-PK unique column)
FarmDetails.belongsTo(FdoAccount, {
  foreignKey: 'fdo_emp_id',
  targetKey: 'emp_id',
  as: 'assignedFdo'
});

FdoAccount.hasMany(FarmDetails, {
  foreignKey: 'fdo_emp_id',
  sourceKey: 'emp_id',
  as: 'assignedFarms'
});

module.exports = FarmDetails;
