/**
 * aqiService.js
 *
 * AQI utility functions — categorization and colour lookup.
 *
 * All category logic reads from the centralized AQI_CATEGORIES constant.
 * Never duplicate category thresholds elsewhere.
 */

'use strict';

const { AQI_CATEGORIES } = require('../config/constants');

/**
 * Return the AQI category label for a numeric AQI value.
 *
 * Iterates the AQI_CATEGORIES list (defined in constants.js) and returns the
 * first band whose [min, max] range includes the given value.
 *
 * @param {number} aqi - Numeric AQI value (0–999+).
 * @returns {string} Category label, e.g. "Good", "Moderate".
 *                   Returns "Unknown" if aqi is not a valid number.
 */
function getAQICategory(aqi) {
  if (typeof aqi !== 'number' || isNaN(aqi) || aqi < 0) {
    return 'Unknown';
  }

  for (const band of AQI_CATEGORIES) {
    if (aqi >= band.min && aqi <= band.max) {
      return band.category;
    }
  }

  // Fallback — AQI above 9999; treat as Hazardous
  return 'Hazardous';
}

/**
 * Return the display colour associated with an AQI category.
 *
 * Useful for the frontend to colour-code map markers or chart bars without
 * needing to re-implement the threshold logic.
 *
 * @param {number} aqi - Numeric AQI value.
 * @returns {string} Hex colour string, e.g. "#00e400".
 *                   Returns "#cccccc" (grey) for unknown/invalid AQI.
 */
function getAQIColor(aqi) {
  if (typeof aqi !== 'number' || isNaN(aqi) || aqi < 0) {
    return '#cccccc';
  }

  for (const band of AQI_CATEGORIES) {
    if (aqi >= band.min && aqi <= band.max) {
      return band.color;
    }
  }

  return '#7e0023'; // Hazardous default
}

/**
 * Return the full AQI band descriptor for a numeric AQI value.
 *
 * @param {number} aqi - Numeric AQI value.
 * @returns {{ min, max, category, color } | null}
 */
function getAQIBand(aqi) {
  if (typeof aqi !== 'number' || isNaN(aqi) || aqi < 0) {
    return null;
  }

  for (const band of AQI_CATEGORIES) {
    if (aqi >= band.min && aqi <= band.max) {
      return band;
    }
  }

  return null;
}

/**
 * Return all AQI category bands with their metadata.
 * Useful for the frontend to render a legend.
 *
 * @returns {object[]} Copy of AQI_CATEGORIES.
 */
function getAllAQICategories() {
  return AQI_CATEGORIES.map((band) => ({ ...band }));
}

module.exports = {
  getAQICategory,
  getAQIColor,
  getAQIBand,
  getAllAQICategories,
};
