import React, { Component } from "react";
import * as d3 from "d3";
import { regionColorScale, normalizeRegion } from "../data/colorScales";

class Chart1 extends Component {
  constructor(props) {
    super(props);

    this.width = 800;
    this.height = 500;

    this.margin = {
      top: 50,
      right: 20,
      bottom: 20,
      left: 20
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

  handleRegionClick = (region) => {
    if (this.props.onRegionSelect) {
      this.props.onRegionSelect(region);
    }
  };

  drawChart() {
    const { data } = this.props;
    const container = document.getElementById("chart1-container");

    if (!data || data.length === 0 || !container) return;

    d3.select(container).selectAll("*").remove();

    const width = this.width;
    const height = this.height;

    // ==========================
    // SVG
    // ==========================
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height + this.margin.top);

    // ==========================
    // CENTERING LOGIC
    // ==========================
    const treemapWidth = width * 0.92; // leave side breathing room
    const offsetX = (width - treemapWidth) / 2;

    const g = svg.append("g")
      .attr("transform", `translate(${offsetX},${this.margin.top})`);

    // ==========================
    // DATA
    // ==========================
    const rootData = {
      name: "world",
      children: d3.groups(data, d => d.region).map(([region, values]) => ({
        name: region,
        children: values.map(d => ({
          name: d.university,
          value: d.qs_score || 0
        }))
      }))
    };

    const root = d3.hierarchy(rootData)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([treemapWidth, height])
      .padding(2)(root);

    const leaves = root.leaves();

    // ==========================
    // TOOLTIP
    // ==========================
    const tooltip = d3.select(container)
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
    // NODES
    // ==========================
    const nodes = g.selectAll("g")
      .data(leaves)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d =>
        regionColorScale(normalizeRegion(d.parent.data.name))
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("opacity", 0.85)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        this.handleRegionClick(d.parent.data.name);
      })
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 1);

        const [x, y] = d3.pointer(event, container);

        tooltip
          .style("opacity", 1)
          .style("left", x + 10 + "px")
          .style("top", y + 10 + "px")
          .html(`
            <strong>${d.data.name}</strong><br/>
            Region: ${d.parent.data.name}<br/>
            QS Score: ${Math.round(d.value)}
          `);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 0.85);
        tooltip.style("opacity", 0);
      });

    nodes.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", "10px")
      .attr("fill", "white")
      .style("pointer-events", "none")
      .text(d =>
        d.x1 - d.x0 > 60
          ? d.data.name.length > 12
            ? d.data.name.slice(0, 12) + "..."
            : d.data.name
          : ""
      );

    // ==========================
    // TITLE (CENTERED)
    // ==========================
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Regional Academic Strength (QS Score)");
  }

  render() {
    return (
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <div id="chart1-container" />
      </div>
    );
  }
}

export default Chart1;