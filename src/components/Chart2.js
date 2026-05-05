import React, { Component } from "react";
import * as d3 from "d3";
import { regionColorScale, normalizeRegion } from "../data/colorScales";

class Chart2 extends Component {
  constructor(props) {
    super(props);

    this.margin = { top: 50, right: 30, bottom: 60, left: 70 };
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.drawChart();
    }
  }

  drawChart() {
    const { data } = this.props;
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

    const titleOffset = 30;

    const g = svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top + titleOffset})`);

    // FILTER (80–100 ONLY)
    const filteredData = data.filter(
      d =>
        d.qs_academic_rep >= 60 &&
        d.qs_academic_rep <= 100 &&
        d.qs_citations >= 60 &&
        d.qs_citations <= 100
    );

    // SCALES
    const xScale = d3
      .scaleLinear()
      .domain([80, 100])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([80, 100])
      .range([height, 0]);

    // AXES
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .text("Academic Reputation");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .text("Citations");

    // TOOLTIP
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

    // POINTS
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
          .attr("stroke", "#000");

        const [x, y] = d3.pointer(event, container);

        tooltip
          .style("opacity", 1)
          .style("left", x + 10 + "px")
          .style("top", y - 10 + "px")
          .html(`
            <strong>${d.university}</strong><br/>
            ${d.region}<br/>
            Academic Rep: ${d.qs_academic_rep}<br/>
            Citations: ${d.qs_citations}
          `);
      })
      .on("mouseout", function () {
        d3.selectAll("circle").attr("opacity", 0.6);

        d3.select(this)
          .attr("r", 4)
          .attr("stroke", "none");

        tooltip.style("opacity", 0);
      });

    // TITLE
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Academic Reputation vs Citations");
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        <div id="chart2-container" style={{ position: "relative" }} />
      </div>
    );
  }
}

export default Chart2;