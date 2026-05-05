import React, { Component } from 'react';
import * as d3 from 'd3';
import './SummaryPanel.css';

class SummaryPanel extends Component {
  render() {
    const { data } = this.props;

    const safeData = (data || []).filter(d => d);

    if (safeData.length === 0) {
      return (
        <div className="summary-panel">
          <p>No data available</p>
        </div>
      );
    }

    // ==========================
    // Basic Counts
    // ==========================
    const totalUniversities = safeData.length;

    const regions = [...new Set(safeData.map(d => d.region).filter(Boolean))];
    const countries = [...new Set(safeData.map(d => d.country).filter(Boolean))];

    // ==========================
    // Ranking Stats
    // ==========================
    const qsRanks = safeData
      .map(d => d.qs_rank_2026)
      .filter(v => Number.isFinite(v));

    const avgRank = qsRanks.length ? d3.mean(qsRanks) : null;
    const medianRank = qsRanks.length ? d3.median(qsRanks) : null;

    // ==========================
    // Score Stats
    // ==========================
    const qsScores = safeData
      .map(d => d.qs_score)
      .filter(v => Number.isFinite(v));

    const avgScore = qsScores.length ? d3.mean(qsScores) : null;

    // ==========================
    // Top Universities
    // ==========================
    const topQS = [...safeData]
      .filter(d => Number.isFinite(d.qs_rank_2026))
      .sort((a, b) => a.qs_rank_2026 - b.qs_rank_2026)
      .slice(0, 5);

    // ==========================
    // Render
    // ==========================
    return (
      <div className="summary-panel">

        <h3>Summary Statistics</h3>

        {/* ================= FLEX LAYOUT ================= */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* ================= LEFT SIDE (3x2 GRID) ================= */}
          <div style={{ flex: 2 }}>

            <div
              className="stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
                gap: '12px'
              }}
            >

              <div className="stat-card">
                <div className="stat-value">{totalUniversities.toLocaleString()}</div>
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

          {/* ================= RIGHT SIDE (TOP 5) ================= */}
          <div style={{ flex: 1 }}>

            <h4>Top 5 Universities (QS)</h4>

            <ol style={{ paddingLeft: '18px', margin: 0 }}>
              {topQS.map((uni, i) => (
                <li key={i} style={{ fontSize: '18px', marginBottom: '6px' }}>
                  {uni.university} (#{uni.qs_rank_2026})
                </li>
              ))}
            </ol>

          </div>

        </div>
      </div>
    );
  }
}

export default SummaryPanel;