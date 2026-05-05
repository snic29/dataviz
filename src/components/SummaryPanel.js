import React, { Component } from 'react';
import * as d3 from 'd3';
import './SummaryPanel.css';

class SummaryPanel extends Component {
  render() {
  const { data } = this.props;

  const safeData = (data || []).filter(d => d);

  if (safeData.length === 0) {
    return <p>No data available</p>;
  }

  // ==========================
  // Stats
  // ==========================
  const totalUniversities = safeData.length;

  const regions = [...new Set(safeData.map(d => d.region).filter(Boolean))];
  const countries = [...new Set(safeData.map(d => d.country).filter(Boolean))];

  const qsRanks = safeData
    .map(d => d.qs_rank_2026)
    .filter(v => Number.isFinite(v));

  const avgRank = qsRanks.length ? d3.mean(qsRanks) : null;
  const medianRank = qsRanks.length ? d3.median(qsRanks) : null;

  const qsScores = safeData
    .map(d => d.qs_score)
    .filter(v => Number.isFinite(v));

  const avgScore = qsScores.length ? d3.mean(qsScores) : null;

  const topQS = [...safeData]
    .filter(d => Number.isFinite(d.qs_rank_2026))
    .sort((a, b) => a.qs_rank_2026 - b.qs_rank_2026)
    .slice(0, 5);

  return (
    <div className="summary-wrapper">

      {/* ================= LEFT PANEL ================= */}
      <div className="summary-box">
        <h3 className="panel-title">Summary Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalUniversities}</div>
            <div className="stat-label">Universities</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{regions.length}</div>
            <div className="stat-label">Regions</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{countries.length}</div>
            <div className="stat-label">Countries</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">
              {avgRank ? avgRank.toFixed(1) : '—'}
            </div>
            <div className="stat-label">Avg QS Rank</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">
              {medianRank ? medianRank.toFixed(1) : '—'}
            </div>
            <div className="stat-label">Median QS Rank</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">
              {avgScore ? avgScore.toFixed(1) : '—'}
            </div>
            <div className="stat-label">Avg QS Score</div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="summary-box">
<h3 className="panel-title">Top 5 Universities</h3>
        <ol className="top-list">
          {topQS.map((uni, i) => (
            <li key={i}>
              {uni.university} (#{uni.qs_rank_2026})
            </li>
          ))}
        </ol>
      </div>

    </div>
  );
}
}

export default SummaryPanel;