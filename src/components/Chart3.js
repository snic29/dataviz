import React, { Component } from "react";
import * as d3 from "d3";
import { getRegionalAverages } from "../data/dataLoader";

class Chart3 extends Component {
    constructor(props) {
        super(props);

        this.width = 900;
        this.height = 550;
        this.margin = { top: 100, right: 120, bottom: 80, left: 180 };

        this.state = {
            sortMetric: "industryIncome"
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.data !== this.props.data ||
            prevState.sortMetric !== this.state.sortMetric
        ) {
            this.drawChart();
        }
    }

    // ==========================
    // Data Processing
    // ==========================
    processData(data) {
        const regionalAverages = getRegionalAverages(data);

        const metrics = [
            { key: "industryIncome", field: "the_industry", label: "Industry Income" },
            { key: "internationalOutlook", field: "the_intl_outlook", label: "International Outlook" },
            { key: "researchQuality", field: "the_research_quality", label: "Research Quality" },
            { key: "teaching", field: "the_teaching", label: "Teaching" }
        ];

        const result = [];

        regionalAverages.forEach((values, region) => {
            const regionUniversities = data.filter(d => d.region === region);

            const row = { region };

            metrics.forEach(m => {
                const validValues = regionUniversities
                    .map(d => d[m.field])
                    .filter(v => Number.isFinite(v));

                row[m.key] = validValues.length ? d3.mean(validValues) : null;

                const best = regionUniversities
                    .filter(d => Number.isFinite(d[m.field]))
                    .sort((a, b) => b[m.field] - a[m.field])[0];

                row[`${m.key}_top`] = best
                    ? {
                        name: best.university,
                        value: best[m.field]
                    }
                    : null;
            });

            result.push(row);
        });

        return { result, metrics };
    }

    drawChart() {
        const data = this.props.data;
        const container = document.getElementById("chart3-container");

        if (!data || data.length === 0 || !container) return;

        d3.select(container).selectAll("*").remove();

        const { width, height, margin } = this;

        const { result: heatmapData, metrics } = this.processData(data);

        // ==========================
        // Sorting
        // ==========================
        const { sortMetric } = this.state;
        heatmapData.sort((a, b) => (b[sortMetric] || 0) - (a[sortMetric] || 0));

        // ==========================
        // Scales
        // ==========================
        const xScale = d3.scaleBand()
            .domain(metrics.map(m => m.label))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleBand()
            .domain(heatmapData.map(d => d.region))
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
        // TOOLTIP (FIXED)
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
        // CELLS
        // ==========================
        const cells = svg.selectAll(".cell")
            .data(
                heatmapData.flatMap(region =>
                    metrics.map(m => ({
                        region: region.region,
                        metric: m.label,
                        key: m.key,
                        value: region[m.key],
                        top: region[`${m.key}_top`]
                    }))
                )
            )
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.metric))
            .attr("y", d => yScale(d.region))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => d.value ? color(d.value) : "#eee")
            .attr("stroke", "#fff")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${d.region}</strong><br/>
                        ${d.metric}: ${d.value?.toFixed(1) || "—"}<br/>
                        Top Uni: ${d.top?.name || "N/A"}<br/>
                        Score: ${d.top?.value?.toFixed(1) || "—"}
                    `);
            })
            .on("mousemove", (event) => {
                const [x, y] = d3.pointer(event, container);

                tooltip
                    .style("left", x + 12 + "px")
                    .style("top", y + 12 + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        // ==========================
        // LABELS
        // ==========================
        svg.selectAll(".cell-text")
            .data(cells.data())
            .enter()
            .append("text")
            .attr("x", d => xScale(d.metric) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.region) + yScale.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "11px")
            .text(d => d.value ? d.value.toFixed(0) : "—");

        // ==========================
        // HEADERS (CLICKABLE + WRAPPED)
        // ==========================
        const headers = svg.selectAll(".x-label")
            .data(metrics)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr("y", margin.top - 30)
            .attr("text-anchor", "middle")
            .style("cursor", "pointer")
            .style("font-weight", d =>
                d.key === sortMetric ? "bold" : "normal"
            )
            .on("click", (event, d) => {
                this.setState({ sortMetric: d.key });
            });

        headers.each(function (d) {
            const words = d.label.split(" ");

            const text = d3.select(this);
            text.selectAll("tspan")
                .data(words)
                .enter()
                .append("tspan")
                .attr("x", xScale(d.label) + xScale.bandwidth() / 2)
                .attr("dy", (w, i) => (i === 0 ? 0 : "1.1em"))
                .text(w => w);
        });

        // ==========================
        // ROW LABELS
        // ==========================
        svg.selectAll(".y-label")
            .data(heatmapData)
            .enter()
            .append("text")
            .attr("x", margin.left - 10)
            .attr("y", d => yScale(d.region) + yScale.bandwidth() / 2)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "12px")
            .text(d => d.region);

        // ==========================
        // TITLE
        // ==========================
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Regional Specialization Across Key Metrics");


        // ==========================
        // LEGEND
        // ==========================
        const legendWidth = 200;
        const legendHeight = 10;

        const legendScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, legendWidth]);

        const legend = svg.append("g")
            .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - margin.bottom + 40})`);

        const defs = svg.append("defs");

        const gradient = defs.append("linearGradient")
            .attr("id", "heatmap-gradient");

        gradient.selectAll("stop")
            .data(d3.range(0, 1.01, 0.1))
            .enter()
            .append("stop")
            .attr("offset", d => `${d * 100}%`)
            .attr("stop-color", d => color(d * 100));

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#heatmap-gradient)");

        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(d3.axisBottom(legendScale).ticks(5));

        legend.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", -8)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Score");
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