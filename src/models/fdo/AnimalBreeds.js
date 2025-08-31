const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');

const AnimalBreed = sequelize.define('AnimalBreed', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  cow_breed: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  buffalo_breed: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'animal_breeds',
  timestamps: false
});

module.exports = AnimalBreed;
