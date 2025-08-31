const animalRules = require('../../services/fdo/animalRulesService');

async function matchAnimalRule(req, res) {
  try {
    const {
      is_inseminated,
      is_pregnant,
      calving_number,
      is_dry,
      pdr
    } = req.body || {};

    const missing = [];
    if (is_inseminated == null) missing.push('is_inseminated');
    if (is_pregnant == null) missing.push('is_pregnant');
    if (calving_number == null) missing.push('calving_number');
    if (is_dry == null) missing.push('is_dry');
    if (pdr == null) missing.push('pdr');

    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const result = await animalRules.getRuleForInputs({
      is_inseminated,
      is_pregnant,
      calving_number,
      is_dry,
      pdr
    });

    if (!result) {
      return res.status(404).json({ error: 'No matching rule found' });
    }

    return res.json(result);
  } catch (err) {
    console.error('getAnimalRule error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function fetchAllRules(req, res) {
  try {
    const rules = await animalRules.getAllRules();
    return res.json(rules);
  } catch (err) {
    console.error('fetchAllRules error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { matchAnimalRule, fetchAllRules };
