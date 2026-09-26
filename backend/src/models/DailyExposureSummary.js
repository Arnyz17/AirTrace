/**
 * DailyExposureSummary.js
 *
 * Factory and documentation for the DailyExposureSummary domain object.
 *
 * A DailyExposureSummary aggregates all ExposureRecords for a single calendar
 * date into a compact summary that the frontend can render as a dashboard card,
 * chart, or timeline.
 *
 * Fields
 * ──────
 *  date                   {string}   YYYY-MM-DD of the summarised day.
 *  totalExposure          {number}   Sum of exposure across all visits.
 *  averageAQI             {number}   Duration-weighted average AQI (rounded to
 *                                    1 decimal place).
 *  highestAQI             {number}   Maximum AQI observed on this day.
 *  highestAQILocation     {string}   Name of the location with the highest AQI.
 *  highestExposureLocation{string}   Name of the location with the greatest
 *                                    individual exposure contribution.
 *  totalMinutesTracked    {number}   Sum of durationMinutes across all visits.
 *  numberOfLocations      {number}   Count of distinct location names visited.
 *  exposureRecords        {object[]} Array of ExposureRecord objects for the day.
 *  categoryBreakdown      {object}   Maps AQI category label → total minutes
 *                                    spent in that category.
 *  locationBreakdown      {object[]} Per-location aggregation:
 *                                    [ { locationName, totalMinutes,
 *                                        totalExposure, averageAQI } ]
 *
 * Note on averageAQI calculation
 * ───────────────────────────────
 *  AirTrace uses a *duration-weighted* average rather than a simple mean.
 *  This prevents a brief high-AQI visit from distorting the daily picture
 *  as much as a plain average would.
 *
 *  weightedAverageAQI = Σ(AQI_i × duration_i) / Σ(duration_i)
 */

'use strict';

/**
 * Create a DailyExposureSummary object.
 *
 * @param {object} fields - Aggregated field values.
 * @returns {object} A DailyExposureSummary plain object.
 */
function createDailyExposureSummary({
  date,
  totalExposure,
  averageAQI,
  highestAQI,
  highestAQILocation,
  highestExposureLocation,
  totalMinutesTracked,
  numberOfLocations,
  exposureRecords,
  categoryBreakdown,
  locationBreakdown,
}) {
  return {
    date,
    totalExposure,
    averageAQI,
    highestAQI,
    highestAQILocation,
    highestExposureLocation,
    totalMinutesTracked,
    numberOfLocations,
    exposureRecords,
    categoryBreakdown,
    locationBreakdown,
  };
}

module.exports = { createDailyExposureSummary };
