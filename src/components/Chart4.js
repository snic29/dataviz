import React, { Component } from "react";
import * as d3 from "d3";

class Chart4 extends Component {
  constructor(props) {
    super(props);

    this.width = 920;
    this.height = 520;

    this.margin = {
      top: 40,
      right: 40,
      bottom: 90,
      left: 70,
    };
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.drawChart();
    }
  }

  // ==========================
  // Stats helpers (unchanged)
  // ==========================
  quantile(sorted, p) {
    const n = sorted.length;
    if (!n) return null;
    if (n === 1) return sorted[0];

    const index = (n - 1) * p;
    const lo = Math.floor(index);
    const hi = Math.ceil(index);
    const h = index - lo;

    if (lo === hi) return sorted[lo];
    return sorted[lo] * (1 - h) + sorted[hi] * h;
  }

  getBoxStats(values) {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return null;

    const q1 = this.quantile(sorted, 0.25);
    const median = this.quantile(sorted, 0.5);
    const q3 = this.quantile(sorted, 0.75);
    const iqr = q3 - q1;

    const low = q1 - 1.5 * iqr;
    const high = q3 + 1.5 * iqr;

    return {
      q1,
      median,
      q3,
      whiskerLow: sorted.find(v => v >= low) ?? sorted[0],
      whiskerHigh: [...sorted].reverse().find(v => v <= high) ?? sorted.at(-1),
      outliers: sorted.filter(v => v < low || v > high),
    };
  }

  // ==========================
  // Data prep
  // ==========================
  processData(data) {
    const fields = [
      { key: "qs_score", label: "QS Score" },
      { key: "the_score", label: "THE Score" },
      { key: "arwu_score", label: "ARWU Score" },
    ];

    return fields
      .map(f => {
        const values = data
          .map(d => Number(d[f.key]))
          .filter(Number.isFinite);

        return {
          label: f.label,
          stats: this.getBoxStats(values),
        };
      })
      .filter(d => d.stats);
  }

  drawChart() {
    const data = this.props.data;
    const container = document.getElementById("chart4-container");

    if (!data || data.length === 0 || !container) return;

    d3.select(container).selectAll("*").remove();

    const chartData = this.processData(data);
    if (!chartData.length) return;

    const { width, height, margin } = this;

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const allValues = chartData.flatMap(d => [
      d.stats.whiskerLow,
      d.stats.whiskerHigh,
      ...d.stats.outliers,
    ]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(allValues) - 2,
        d3.max(allValues) + 2
      ])
      .range([height - margin.bottom, margin.top]);

    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // ==========================
    // Grid + axis
    // ==========================
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg.selectAll(".grid")
      .data(yScale.ticks(6))
      .enter()
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#eee");

    // ==========================
    // Tooltip
    // ==========================
    const tooltip = d3.select(container)
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("opacity", 0);

    // ==========================
    // Draw boxplots
    // ==========================
    chartData.forEach(d => {
      const x = xScale(d.label) + xScale.bandwidth() / 2;
      const s = d.stats;

      // whisker line
      svg.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(s.whiskerLow))
        .attr("y2", yScale(s.whiskerHigh))
        .attr("stroke", "#333");

      // box
      svg.append("rect")
        .attr("x", x - 25)
        .attr("y", yScale(s.q3))
        .attr("width", 50)
        .attr("height", Math.max(1, yScale(s.q1) - yScale(s.q3)))
        .attr("fill", "#cfe8ff")
        .attr("stroke", "#1d4ed8");

      // median
      svg.append("line")
        .attr("x1", x - 25)
        .attr("x2", x + 25)
        .attr("y1", yScale(s.median))
        .attr("y2", yScale(s.median))
        .attr("stroke", "#1d4ed8")
        .attr("stroke-width", 3);

      // outliers
      svg.selectAll(`.out-${d.label}`)
        .data(s.outliers)
        .enter()
        .append("circle")
        .attr("cx", x)
        .attr("cy", v => yScale(v))
        .attr("r", 4)
        .attr("fill", "#ef4444");

      // label
      svg.append("text")
        .attr("x", x)
        .attr("y", height - margin.bottom + 30)
        .attr("text-anchor", "middle")
        .text(d.label);
    });

    // ==========================
    // Title
    // ==========================
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("University Score Distribution");
  }

  render() {
    return (
      <div>
        <div id="chart4-container" style={{ position: "relative" }}></div>
      </div>
    );
  }
}

export default Chart4;