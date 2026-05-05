import React, { Component } from "react";
import * as d3 from "d3";
import { regionColorScale, normalizeRegion } from "../data/colorScales";

class Chart2 extends Component {
  constructor(props) {
    super(props);

this.margin = { top: 40, right: 30, bottom: 50, left: 70 };

    this.state = {
      viewMode: "zoomed", // "full" | "zoomed"
    };
  }

  // ==========================
  // Toggle handler
  // ==========================
  toggleView = () => {
    this.setState(
      prev => ({
        viewMode: prev.viewMode === "full" ? "zoomed" : "full",
      }),
      () => this.drawChart()
    );
  };

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data !== this.props.data || prevState.viewMode !== this.state.viewMode) {
      this.drawChart();
    }
  }

  // ==========================
  // Regression
  // ==========================
  calculateRegression(data) {
    const n = data.length;
    if (n === 0) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach(d => {
      sumX += d.qs_academic_rep;
      sumY += d.qs_citations;
      sumXY += d.qs_academic_rep * d.qs_citations;
      sumX2 += d.qs_academic_rep ** 2;
    });

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    return {
      predict: (x) => intercept + slope * x
    };
  }

  // ==========================
  // Draw chart
  // ==========================
  drawChart() {
    const { data } = this.props;
    const { viewMode } = this.state;

    const container = document.getElementById("chart2-container");
    if (!data || data.length === 0 || !container) return;

    d3.select(container).selectAll("*").remove();

    const containerWidth = container.offsetWidth;
    const containerHeight = 500;

    const width = containerWidth - this.margin.left - this.margin.right;
    const height = containerHeight - this.margin.top - this.margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    const g = svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // ==========================
    // DATA (optional filter in zoom mode)
    // ==========================
    const filteredData =
      viewMode === "zoomed"
        ? data.filter(
            d =>
              d.qs_academic_rep >= 60 &&
              d.qs_academic_rep <= 100 &&
              d.qs_citations >= 60 &&
              d.qs_citations <= 100
          )
        : data;

    // ==========================
    // FIXED SCALES (toggle aware)
    // ==========================
    const xScale =
      viewMode === "zoomed"
        ? d3.scaleLinear().domain([80, 100]).range([0, width*0.7])
        : d3.scaleLinear()
            .domain(d3.extent(data, d => d.qs_academic_rep))
            .nice()
            .range([0, width]);

    const yScale =
      viewMode === "zoomed"
        ? d3.scaleLinear().domain([80, 100]).range([height, 0])
        : d3.scaleLinear()
            .domain(d3.extent(data, d => d.qs_citations))
            .nice()
            .range([height, 0]);

    // ==========================
    // AXES
    // ==========================
    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0,${height})`);

    const yAxisGroup = g.append("g");

    xAxisGroup.call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));

    g.append("text")
  .attr("x", width / 2)
  .attr("y", height + 40)
  .attr("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("fill", "#444")
  .text("Academic Reputation");

  g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -50)
  .attr("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("fill", "#444")
  .text("Citations");

    /*
    // ==========================
    // REGRESSION
    // ==========================
    const regression = this.calculateRegression(filteredData);

    if (regression) {
      const [minX, maxX] = xScale.domain();

      g.append("line")
        .attr("x1", xScale(minX))
        .attr("y1", yScale(regression.predict(minX)))
        .attr("x2", xScale(maxX))
        .attr("y2", yScale(regression.predict(maxX)))
        .attr("stroke", "#666")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
    } */

    // ==========================
    // TOOLTIP
    // ==========================
    const tooltip = d3
      .select(container)
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("opacity", 0)
      .style("pointer-events", "none");

    // ==========================
    // POINTS
    // ==========================
    const circles = g.selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.qs_academic_rep))
      .attr("cy", d => yScale(d.qs_citations))
      .attr("r", 4)
      .attr("fill", d => regionColorScale(normalizeRegion(d.region)))
      .attr("opacity", 0.6);

    circles
      .on("mouseover", function (event, d) {
        d3.selectAll("circle").attr("opacity", 0.15);

        d3.select(this)
          .attr("r", 8)
          .attr("opacity", 1)
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5);

        const [x, y] = d3.pointer(event, container);

        tooltip
          .style("opacity", 1)
          .style("left", x + 10 + "px")
          .style("top", y - 10 + "px")
          .html(
            `<strong>${d.university}</strong><br/>
             Region: ${d.region}<br/>
             Academic Rep: ${d.qs_academic_rep}<br/>
             Citations: ${d.qs_citations}`
          );
      })
      .on("mouseout", function () {
        d3.selectAll("circle").attr("opacity", 0.6);

        d3.select(this)
          .attr("r", 4)
          .attr("stroke", "none");

        tooltip.style("opacity", 0);
      });

    // ==========================
    // TITLE
    // ==========================
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(
        `Academic Reputation vs Citations (${viewMode === "zoomed" ? "80–100 View" : "Full View"})`
      );
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        {/* Toggle button */}
        <button
          onClick={this.toggleView}
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            zIndex: 10,
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          Toggle View
        </button>

        <div id="chart2-container" style={{ position: "relative" }} />
      </div>
    );
  }
}

export default Chart2;