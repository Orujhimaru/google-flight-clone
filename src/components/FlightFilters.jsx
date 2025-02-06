import React, { useState } from "react";
import { FilterIcon } from "./Icons";

export const FlightFilters = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculatePosition = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `calc(${percentage}% - 0px)`;
  };

  return (
    <div className="flight-filters">
      <div
        className="filters-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="filters-title">
          <FilterIcon />
          <h2>Filters</h2>
        </div>
        <button
          className={`expand-button ${isExpanded ? "expanded" : ""}`}
          aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
        >
          ▼
        </button>
      </div>

      <div className={`filters-content ${isExpanded ? "expanded" : ""}`}>
        <div className="sort-filters">
          <div className="filter-section">
            <h3>Sort By</h3>
            <div className="sort-options">
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange("sortBy", e.target.value)}
              >
                <option value="">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="duration_asc">
                  Duration: Shortest to Longest
                </option>
                <option value="duration_desc">
                  Duration: Longest to Shortest
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="range-filters">
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <div className="slider-container">
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                />
                <div
                  className="price-indicator"
                  style={{ left: calculatePosition(filters.maxPrice, 0, 2000) }}
                >
                  ${filters.maxPrice}
                </div>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Flight Duration</h3>
            <div className="duration-range">
              <div className="slider-container">
                <input
                  type="range"
                  min={1}
                  max={18}
                  step={0.5}
                  value={filters.maxDuration}
                  onChange={(e) =>
                    onFilterChange("maxDuration", e.target.value)
                  }
                />
                <div
                  className="duration-indicator"
                  style={{
                    left: calculatePosition(filters.maxDuration, 1, 18),
                  }}
                >
                  {filters.maxDuration} hrs
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <h3>Stops</h3>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.stops.direct}
                onChange={(e) =>
                  onFilterChange("stops", {
                    ...filters.stops,
                    direct: e.target.checked,
                  })
                }
              />
              Direct
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.stops.oneStop}
                onChange={(e) =>
                  onFilterChange("stops", {
                    ...filters.stops,
                    oneStop: e.target.checked,
                  })
                }
              />
              1 Stop
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.stops.twoPlus}
                onChange={(e) =>
                  onFilterChange("stops", {
                    ...filters.stops,
                    twoPlus: e.target.checked,
                  })
                }
              />
              2+ Stops
            </label>
          </div>
        </div>

        <div className="filter-section">
          <h3>Time of Day</h3>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.timeOfDay.morning}
                onChange={(e) =>
                  onFilterChange("timeOfDay", {
                    ...filters.timeOfDay,
                    morning: e.target.checked,
                  })
                }
              />
              🌤️ Morning (6AM-12PM)
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.timeOfDay.afternoon}
                onChange={(e) =>
                  onFilterChange("timeOfDay", {
                    ...filters.timeOfDay,
                    afternoon: e.target.checked,
                  })
                }
              />
              ☀️ Afternoon (12PM-6PM)
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.timeOfDay.evening}
                onChange={(e) =>
                  onFilterChange("timeOfDay", {
                    ...filters.timeOfDay,
                    evening: e.target.checked,
                  })
                }
              />
              ��️ Evening (6PM-12AM)
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.timeOfDay.night}
                onChange={(e) =>
                  onFilterChange("timeOfDay", {
                    ...filters.timeOfDay,
                    night: e.target.checked,
                  })
                }
              />
              🌙 Night (12AM-6AM)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
