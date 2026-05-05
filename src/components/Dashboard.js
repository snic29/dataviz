import React, { Component } from "react";
import { loadUniversityData } from "../data/dataLoader";

import Chart1 from "./Chart1";
import Chart2 from "./Chart2";
import Chart3 from "./Chart3";
import Chart4 from "./Chart4";

import FilterPanel from "./FilterPanel";
import SummaryPanel from "./SummaryPanel";
import "./Dashboard.css";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      filteredData: [],
      loading: true,

      filters: {
        region: "all",
        country: "all",
        universityType: "all",
        minRank: 1,
        maxRank: 300
      },
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const data = await loadUniversityData();

      this.setState({
        data,
        filteredData: data,
        loading: false,
      });
    } catch (err) {
      console.error("Error loading data:", err);
      this.setState({ loading: false });
    }
  };

  handleFiltersChange = (newFilters) => {
    const { data } = this.state;

    const filteredData = data.filter((d) => {
      const rank = d.qs_rank_2026;

      return (
        (rank == null || (rank >= newFilters.minRank && rank <= newFilters.maxRank)) &&
        (newFilters.region === "all" || d.region === newFilters.region) &&
        (newFilters.country === "all" || d.country === newFilters.country) &&
        (newFilters.universityType === "all" || d.university_type === newFilters.universityType)
      );
    });

    this.setState({
      filters: newFilters,
      filteredData,
    });
  };

  render() {
    const { loading, filteredData, filters } = this.state;

    if (loading) {
      return <div style={{ padding: 20 }}>Loading dashboard...</div>;
    }

    return (
      <div className="dashboard-container">

        <div className="dashboard-header">
          <h1>University Rankings Dashboard</h1>
          <p>Global analysis of academic performance and ranking systems</p>
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={this.handleFiltersChange}
          data={filteredData}
        />

        <div style={{ marginBottom: "40px" }}>
          <SummaryPanel data={filteredData} />
        </div>

        <div className="charts-grid">

          {/* CHART 1 */}
          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">
                Chart 1: Global Academic Power
              </div>
              <div className="chart-subtitle">
                How is global academic power nested within regions and countries, and where are the hubs of excellence?
              </div>
            </div>

            <Chart1 data={filteredData} />
          </div>

          {/* CHART 2 */}
          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">
                Chart 2: Reputation vs Citations
              </div>
              <div className="chart-subtitle">
                Is there a measurable reputation premium between academic reputation and research citations?
              </div>
            </div>

            <Chart2 data={filteredData} />
          </div>

          {/* CHART 3 */}
          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">
                Chart 3: Regional Specialization
              </div>
              <div className="chart-subtitle">
                Which regions specialize across key dimensions of university performance?
              </div>
            </div>

            <Chart3 data={filteredData} />
          </div>

          {/* CHART 4 */}
          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">
                Chart 4: Ranking System Comparison
              </div>
              <div className="chart-subtitle">
                How much do QS, THE, and ARWU rankings disagree in distributions?
              </div>
            </div>

            <Chart4 data={filteredData} />
          </div>

        </div>

      </div>
    );
  }
}

export default Dashboard;