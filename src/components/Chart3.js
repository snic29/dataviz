import React, { Component } from "react";
import * as d3 from "d3";
import { getRegionalAverages } from "../data/dataLoader";

class Chart3 extends Component {
  constructor(props) {
    super(props);

    this.width = 800;
    this.height = 500;
    this.margin = { top: 80, right: 120, bottom: 100, left: 150 };
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
  // Prepare Data
  // ==========================
  processData(data) {
    const regionalAverages = getRegionalAverages(data);

    const heatmapData = [];

    regionalAverages.forEach((values, region) => {
      heatmapData.push({
        region,
        industryIncome: values.avgIndustryIncome,
        internationalOutlook: values.avgInternationalOutlook,
        count: values.count,
        industryRank: 0,
        outlookRank: 0
      });
    });

    // Rankings
    const industryRanks = [...heatmapData]
      .map(d => d.industryIncome)
      .sort((a, b) => b - a);

    const outlookRanks = [...heatmapData]
      .map(d => d.internationalOutlook)
      .sort((a, b) => b - a);

    heatmapData.forEach(d => {
      d.industryRank = industryRanks.indexOf(d.industryIncome) + 1;
      d.outlookRank = outlookRanks.indexOf(d.internationalOutlook) + 1;
    });

    return heatmapData;
  }

  // ==========================
  // Specialist Logic
  // ==========================
  getSpecialistType(regionData) {
    const diff = regionData.industryRank - regionData.outlookRank;

    if (diff <= -2) return "Industry Specialist";
    if (diff >= 2) return "International Specialist";
    return "Balanced";
  }

  drawChart() {
    const data = this.props.data;
    const container = document.getElementById("chart3-container");

    if (!data || data.length === 0 || !container) return;

    d3.select(container).selectAll("*").remove();

    const { width, height, margin } = this;

    const heatmapData = this.processData(data);

    if (!heatmapData || heatmapData.length === 0) return;

    // ==========================
    // Scales
    // ==========================
    const xScale = d3.scaleBand()
      .domain(heatmapData.map(d => d.region))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(["Industry Income", "International Outlook"])
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const color = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([100, 0]);

    // ==========================
    // SVG
    // ==========================
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // ==========================
    // Heatmap cells
    // ==========================
    const groups = svg.selectAll(".region")
      .data(heatmapData)
      .enter()
      .append("g");

    // Industry row
    groups.append("rect")
      .attr("x", d => xScale(d.region))
      .attr("y", yScale("Industry Income"))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => color(d.industryIncome))
      .attr("stroke", "#fff");

    // International row
    groups.append("rect")
      .attr("x", d => xScale(d.region))
      .attr("y", yScale("International Outlook"))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => color(d.internationalOutlook))
      .attr("stroke", "#fff");

    // ==========================
    // Cell labels
    // ==========================
    groups.append("text")
      .attr("x", d => xScale(d.region) + xScale.bandwidth() / 2)
      .attr("y", yScale("Industry Income") + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "11px")
      .text(d => d.industryIncome.toFixed(0));

    groups.append("text")
      .attr("x", d => xScale(d.region) + xScale.bandwidth() / 2)
      .attr("y", yScale("International Outlook") + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "11px")
      .text(d => d.internationalOutlook.toFixed(0));

    // ==========================
    // Axis labels
    // ==========================
    svg.selectAll(".x-label")
      .data(xScale.domain())
      .enter()
      .append("text")
      .attr("x", d => xScale(d) + xScale.bandwidth() / 2)
      .attr("y", height - margin.bottom + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => d);

    svg.selectAll(".y-label")
      .data(yScale.domain())
      .enter()
      .append("text")
      .attr("x", margin.left - 10)
      .attr("y", d => yScale(d) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "12px")
      .text(d => d);

    // ==========================
    // Specialist symbols
    // ==========================
    svg.selectAll(".symbol")
      .data(heatmapData)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.region) + xScale.bandwidth() / 2)
      .attr("y", margin.top - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", d => {
        const type = this.getSpecialistType(d);
        if (type === "Industry Specialist") return "#ff6b6b";
        if (type === "International Specialist") return "#4ecdc4";
        return "#666";
      })
      .text(d => {
        const type = this.getSpecialistType(d);
        if (type === "Industry Specialist") return "▲";
        if (type === "International Specialist") return "◆";
        return "●";
      });

    // ==========================
    // Title
    // ==========================
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Regional Specialists Analysis");
  }

  render() {
    return (
      <div>
        <div id="chart3-container" style={{ position: "relative" }}></div>
      </div>
    );
  }
}

export default Chart3;