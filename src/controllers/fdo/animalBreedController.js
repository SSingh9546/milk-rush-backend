const { getBreeds } = require('../../services/fdo/animalBreedService');

async function fetchBreeds(req, res) {
  try {
    const { species } = req.body;
    if (!['cow', 'buffalo'].includes((species || '').toLowerCase())) {
      return res.status(400).json({ error: "species must be 'cow' or 'buffalo'" });
    }
    const breeds = await getBreeds(species.toLowerCase());
    res.json({ species, breeds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { fetchBreeds };
