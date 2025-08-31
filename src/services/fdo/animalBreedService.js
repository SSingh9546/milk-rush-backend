const AnimalBreed = require('../../models/fdo/AnimalBreeds');

async function getBreeds(species) {
  const col = species === 'buffalo' ? 'buffalo_breed' : 'cow_breed';
  const rows = await AnimalBreed.findAll({ attributes: [col], raw: true });
  return rows.map(r => r[col]).filter(Boolean);
}

module.exports = { getBreeds };
