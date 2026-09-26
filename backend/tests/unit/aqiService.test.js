/**
 * aqiService.test.js
 *
 * Unit tests for AQI categorization.
 *
 * Tests every boundary value of the six AQI categories defined in constants.js.
 */

'use strict';

const { getAQICategory, getAQIColor, getAQIBand, getAllAQICategories } = require('../../src/services/aqiService');

describe('getAQICategory', () => {
  // Good: 0–50
  test('AQI 0 → Good', ()   => expect(getAQICategory(0)).toBe('Good'));
  test('AQI 25 → Good', ()  => expect(getAQICategory(25)).toBe('Good'));
  test('AQI 50 → Good', ()  => expect(getAQICategory(50)).toBe('Good'));

  // Moderate: 51–100
  test('AQI 51 → Moderate', ()  => expect(getAQICategory(51)).toBe('Moderate'));
  test('AQI 75 → Moderate', ()  => expect(getAQICategory(75)).toBe('Moderate'));
  test('AQI 100 → Moderate', () => expect(getAQICategory(100)).toBe('Moderate'));

  // Unhealthy for Sensitive Groups: 101–150
  test('AQI 101 → Unhealthy for Sensitive Groups', () =>
    expect(getAQICategory(101)).toBe('Unhealthy for Sensitive Groups'));
  test('AQI 125 → Unhealthy for Sensitive Groups', () =>
    expect(getAQICategory(125)).toBe('Unhealthy for Sensitive Groups'));
  test('AQI 150 → Unhealthy for Sensitive Groups', () =>
    expect(getAQICategory(150)).toBe('Unhealthy for Sensitive Groups'));

  // Unhealthy: 151–200
  test('AQI 151 → Unhealthy', () => expect(getAQICategory(151)).toBe('Unhealthy'));
  test('AQI 175 → Unhealthy', () => expect(getAQICategory(175)).toBe('Unhealthy'));
  test('AQI 200 → Unhealthy', () => expect(getAQICategory(200)).toBe('Unhealthy'));

  // Very Unhealthy: 201–300
  test('AQI 201 → Very Unhealthy', () => expect(getAQICategory(201)).toBe('Very Unhealthy'));
  test('AQI 250 → Very Unhealthy', () => expect(getAQICategory(250)).toBe('Very Unhealthy'));
  test('AQI 300 → Very Unhealthy', () => expect(getAQICategory(300)).toBe('Very Unhealthy'));

  // Hazardous: 301+
  test('AQI 301 → Hazardous', () => expect(getAQICategory(301)).toBe('Hazardous'));
  test('AQI 500 → Hazardous', () => expect(getAQICategory(500)).toBe('Hazardous'));
  test('AQI 999 → Hazardous', () => expect(getAQICategory(999)).toBe('Hazardous'));

  // Invalid inputs
  test('AQI -1 → Unknown',    () => expect(getAQICategory(-1)).toBe('Unknown'));
  test('NaN → Unknown',       () => expect(getAQICategory(NaN)).toBe('Unknown'));
  test('string → Unknown',    () => expect(getAQICategory('82')).toBe('Unknown'));
  test('null → Unknown',      () => expect(getAQICategory(null)).toBe('Unknown'));
  test('undefined → Unknown', () => expect(getAQICategory(undefined)).toBe('Unknown'));
});

describe('getAQIColor', () => {
  test('AQI 25 returns Good colour',      () => expect(getAQIColor(25)).toBe('#00e400'));
  test('AQI 75 returns Moderate colour',  () => expect(getAQIColor(75)).toBe('#ffff00'));
  test('AQI 125 returns USG colour',      () => expect(getAQIColor(125)).toBe('#ff7e00'));
  test('AQI 175 returns Unhealthy colour',() => expect(getAQIColor(175)).toBe('#ff0000'));
  test('AQI 250 returns VU colour',       () => expect(getAQIColor(250)).toBe('#8f3f97'));
  test('AQI 400 returns Hazardous colour',() => expect(getAQIColor(400)).toBe('#7e0023'));
  test('invalid returns grey',            () => expect(getAQIColor(-1)).toBe('#cccccc'));
});

describe('getAQIBand', () => {
  test('returns correct band for AQI 50', () => {
    const band = getAQIBand(50);
    expect(band.min).toBe(0);
    expect(band.max).toBe(50);
    expect(band.category).toBe('Good');
  });

  test('returns null for negative AQI', () => {
    expect(getAQIBand(-5)).toBeNull();
  });
});

describe('getAllAQICategories', () => {
  test('returns 6 categories', () => {
    expect(getAllAQICategories()).toHaveLength(6);
  });

  test('first category is Good', () => {
    const cats = getAllAQICategories();
    expect(cats[0].category).toBe('Good');
  });

  test('last category is Hazardous', () => {
    const cats = getAllAQICategories();
    expect(cats[cats.length - 1].category).toBe('Hazardous');
  });
});
