const AnimalRule = require('../../models/fdo/AnimalRules');

function normalizeYNNA(val) {
  if (val == null) return 'N/A';
  const t = String(val).trim().toLowerCase();
  if (t === 'yes') return 'Yes';
  if (t === 'no') return 'No';
  if (t === 'n/a' || t === 'na' || t === '') return 'N/A';
  return val; // leave as-is for non-YNNA fields like pdr
}

/**
 * Bucket calving_number for DB matching and extract numeric CN if possible.
 * Input is ALWAYS a string like "n/a", "0", "1", "2", ...
 */
function bucketCalvingNumberStr(cnStr) {
  if (cnStr == null) return { bucket: 'N/A', cnNumber: null };

  const raw = String(cnStr).trim().toLowerCase();
  if (raw === 'n/a' || raw === 'na' || raw === '') {
    return { bucket: 'N/A', cnNumber: null };
  }
  if (raw === '0') {
    return { bucket: '0', cnNumber: 0 };
  }
  // numeric?
  if (/^\d+$/.test(raw)) {
    const n = parseInt(raw, 10);
    if (n >= 1) return { bucket: '≥1', cnNumber: n };
    if (n === 0) return { bucket: '0', cnNumber: 0 };
    return { bucket: 'N/A', cnNumber: null };
  }
  // unknown string → treat as N/A
  return { bucket: 'N/A', cnNumber: null };
}

function computeParityFromRule(storedParity, cnNumber) {
  const rule = (storedParity || '').trim().toUpperCase();

  // No concrete numeric CN → cannot compute
  if (cnNumber == null) {
    if (rule === 'CN' || rule === 'CN+1') return 'N/A';
    return storedParity || 'N/A';
  }

  if (rule === 'CN') return String(cnNumber);
  if (rule === 'CN+1') return String(cnNumber + 1);

  // Literal fallback (e.g., 'N/A')
  return storedParity || 'N/A';
}

/**
 * Find a matching rule and compute the response.
 * @param {Object} inputs
 *  - is_inseminated: 'Yes'|'No'|'N/A' (case-insensitive accepted)
 *  - is_pregnant:    'Yes'|'No'|'N/A'
 *  - calving_number: string "n/a" | "0" | "1" | "2" | ...
 *  - is_dry:         'Yes'|'No'|'N/A'
 *  - pdr:            string (use 'N/A' if blank)
 */
async function getRuleForInputs({ is_inseminated, is_pregnant, calving_number, is_dry, pdr }) {
  const norm = {
    is_inseminated: normalizeYNNA(is_inseminated),
    is_pregnant: normalizeYNNA(is_pregnant),
    is_dry: normalizeYNNA(is_dry),
    pdr: pdr == null || String(pdr).trim() === '' ? 'N/A' : String(pdr).trim(),
  };

  const { bucket, cnNumber } = bucketCalvingNumberStr(calving_number);

  const rule = await AnimalRule.findOne({
    where: {
      is_inseminated: norm.is_inseminated,
      is_pregnant: norm.is_pregnant,
      calving_number: bucket, // 'N/A' | '0' | '≥1'
      is_dry: norm.is_dry,
      pdr: norm.pdr
    }
  });

  if (!rule) return null;

  return {
    lactation_status: rule.lactation_status ?? 'N/A',
    breeding_status: rule.breeding_status ?? 'N/A',
    physiological_stage: rule.physiological_stage ?? 'N/A',

    // LN = CN (numeric); if non-numeric (e.g., 'n/a'), return 'N/A'
    lactation_number: cnNumber != null ? String(cnNumber) : 'N/A',

    // PN depends on stored parity rule (CN or CN+1)
    parity_number: computeParityFromRule(rule.parity_number, cnNumber),

    rule_description: rule.rule_description ?? 'N/A',
    is_active: !!rule.is_active
  };
}

async function getAllRules() {
  return await AnimalRule.findAll();
}

module.exports = { getRuleForInputs, getAllRules };
