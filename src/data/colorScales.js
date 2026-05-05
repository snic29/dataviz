import * as d3 from "d3";

export function normalizeRegion(region) {
  return (region || "")
    .trim()
    .toLowerCase();
}

// Define fixed regions (recommended for consistency)
export const REGIONS = [
  "europe",
  "africa",
  "asia",
  "north america",
  "latin america",
  "oceania",
  "middle east"
];

// Explicit stable palette (better than schemeCategory10 for dashboards)
export const REGION_COLORS = [
  "#3498db", // Europe (blue)
  "#e91e63", // Africa (pink)
  "#9b59b6", // Asia (purple)
  "#f39c12", // North America (orange)
  "#27ae60", // Latin America (green)
  "#e74c3c",  // Oceania (red)
  "#76b7b2", // Middle East (teal)
];

/**
 * Main color scale used across all charts
 */
export const regionColorScale = d3.scaleOrdinal()
  .domain(REGIONS)
  .range(REGION_COLORS);