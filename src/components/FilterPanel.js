import React, { Component } from 'react';
import { loadUniversityData } from '../data/dataLoader';
import './FilterPanel.css';

class FilterPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      universityData: [],
      filters: {
        region: 'all',
        country: 'all',
        universityType: 'all',
        minRank: 1,
        maxRank: 500,
        minAcademicRep: 0,
        maxAcademicRep: 100,
        minInternationalOutlook: 0,
        maxInternationalOutlook: 100
      }
    };
  }

  async componentDidMount() {
    const data = await loadUniversityData();
    this.setState({ universityData: data });
  }

  // ==========================
  // Helpers
  // ==========================
  updateFilters = (newFilters) => {
    this.setState({ filters: newFilters });

    // IMPORTANT: supports BOTH naming styles safely
    const callback =
      this.props.onFilterChange || this.props.onFiltersChange;

    if (typeof callback === 'function') {
      callback(newFilters);
    }
  };

  // ==========================
  // Handlers
  // ==========================
  handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...this.state.filters,
      [filterName]: value
    };

    // reset dependent field
    if (filterName === 'region' && value !== 'all') {
      newFilters.country = 'all';
    }

    this.updateFilters(newFilters);
  };

  resetFilters = () => {
    const defaultFilters = {
      region: 'all',
      country: 'all',
      universityType: 'all',
      minRank: 1,
      maxRank: 500,
      minAcademicRep: 0,
      maxAcademicRep: 100,
      minInternationalOutlook: 0,
      maxInternationalOutlook: 100
    };

    this.updateFilters(defaultFilters);
  };

  // ==========================
  // Derived options
  // ==========================
  getRegions() {
  const { universityData } = this.state;

  return [
    'all',
    ...Array.from(
      new Set(universityData.map(d => d.region).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  ];
}

  getCountries() {
  const { universityData, filters } = this.state;

  let list;

  if (filters.region === 'all') {
    list = universityData.map(d => d.country);
  } else {
    list = universityData
      .filter(d => d.region === filters.region)
      .map(d => d.country);
  }

  return [
    'all',
    ...Array.from(new Set(list.filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
  ];
}

  getUniversityTypes() {
  const { universityData } = this.state;

  return [
    'all',
    ...Array.from(
      new Set(universityData.map(d => d.university_type).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  ];
}

  // ==========================
  // Render
  // ==========================
  render() {
    const { filters } = this.state;

    const regions = this.getRegions();
    const countries = this.getCountries();
    const types = this.getUniversityTypes();

    return (
      <div className="filter-panel">

        {/* HEADER */}
        <div className="filter-header">
          <h3>Filters</h3>
        </div>

        {/* GRID */}
        <div className="filter-controls">

  <div className="filter-group">
    <label>Region</label>
    <select
      value={filters.region}
      onChange={(e) => this.handleFilterChange('region', e.target.value)}
    >
      {regions.map(r => (
        <option key={r} value={r}>
          {r === 'all' ? 'All Regions' : r}
        </option>
      ))}
    </select>
  </div>

  <div className="filter-group">
    <label>Country</label>
    <select
      value={filters.country}
      onChange={(e) => this.handleFilterChange('country', e.target.value)}
    >
      {countries.map(c => (
        <option key={c} value={c}>
          {c === 'all' ? 'All Countries' : c}
        </option>
      ))}
    </select>
  </div>

  <div className="filter-group">
    <label>Type</label>
    <select
      value={filters.universityType}
      onChange={(e) => this.handleFilterChange('universityType', e.target.value)}
    >
      {types.map(t => (
        <option key={t} value={t}>
          {t === 'all' ? 'All Types' : t}
        </option>
      ))}
    </select>
  </div>

  <div className="filter-group qs-group">
    <label>QS Rank</label>
    <div className="range-inputs">
      <input
        type="number"
        value={filters.minRank}
        onChange={(e) =>
          this.handleFilterChange('minRank', Number(e.target.value))
        }
      />
      <span>to</span>
      <input
        type="number"
        value={filters.maxRank}
        onChange={(e) =>
          this.handleFilterChange('maxRank', Number(e.target.value))
        }
      />
    </div>
  </div>

  <div className="filter-actions">
    <button className="reset-button" onClick={this.resetFilters}>
      Reset Filters
    </button>
  </div>

</div>

      </div>
    );
  }

}

export default FilterPanel;