import React, {useEffect, useMemo, useState} from "react";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false; //so commas in locations are not mistaken in csv

  for (let i = 0; i<text.length; i++) {
    const char = text[i];
    const next = text[i+ 1];
    if (char === '"' && inQuotes && next==='"') 
    {
      current += '"';
      i++;
    } 
    else if (char==='"') 
    {
      inQuotes = !inQuotes;
    } 
    else if (char === "," && !inQuotes) 
    {
      row.push(current);
      current = "";
    } 
    else if ((char === "\n" || char === "\r") && !inQuotes) 
    {
      if (current.length>0 || row.length>0) 
      {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      }
      if (char === "\r" && next === "\n") i++;
    } 
    else 
    {
      current += char;
    }
  }

  if (current.length>0 || row.length > 0) 
  {
    row.push(current);
    rows.push(row);
  }

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => 
  {
    const obj = {};
    headers.forEach((h, i) => 
    {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });
}

function quantile(sorted, p) 
{
  const n = sorted.length;
  if (!n) return null;
  if (n===1) return sorted[0];

  const index = (n-1)*p;
  const floorVal=Math.floor(index);
  const ceilingVal = Math.ceil(index);
  const h = index-floorVal;

  if (floorVal===ceilingVal) return sorted[floorVal];
  return sorted[floorVal]*(1-h) + sorted[ceilingVal]*h;
}

function getBoxStats(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a-b);
  if (!sorted.length) return null;

  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3-q1;
  const lowBound = q1 - 1.5*iqr;
  const highBound = q3 + 1.5*iqr;
  const whiskerLow = sorted.find((v) => v >= lowBound) ?? sorted[0];
  const whiskerHigh = [...sorted].reverse().find((v) => v <= highBound) ?? sorted[sorted.length - 1];
  const outliers = sorted.filter((v) => v<lowBound || v>highBound);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    q1,
    median,
    q3,
    whiskerLow,
    whiskerHigh,
    outliers,
  };
}

export default function UniversityScoreBoxplot() 
{
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => 
  {
    async function loadCSV() {
      try {
        const res = await fetch("/world_university_rankings_2026.csv");
        if (!res.ok) throw new Error("not loaded");
        const text = await res.text();
        const parsed = parseCSV(text);
        setData(parsed);
      } catch (err) {
        setError(err.message || "error");
      } finally {
        setLoading(false);
      }
    }
    loadCSV();
  }, []);

  const chartData = useMemo(() => {
    const scoreFields = [
      { key: "qs_score", label: "QS Score" },
      { key: "the_score", label:"THE Score" },
      { key: "arwu_score", label: "ARWU Score" },
    ];

    return scoreFields.map(({key,label}) => {
      const values = data.map((d) => Number(d[key])).filter((v) => Number.isFinite(v));

      return {
        key,
        label,
        stats: getBoxStats(values),
      };
    }).filter((d) => d.stats);
  }, [data]);

  const dimensions = {
    width: 920,
    height: 520,
    marginTop: 40,
    marginRight: 40,
    marginBottom: 90,
    marginLeft: 70,
  };

  const plotWidth = dimensions.width - dimensions.marginLeft - dimensions.marginRight;
  const plotHeight = dimensions.height - dimensions.marginTop - dimensions.marginBottom;
  const allValues = chartData.flatMap((d) => [
    d.stats.whiskerLow,
    d.stats.whiskerHigh,
    ...d.stats.outliers,
  ]);

  const yMin = Math.min(...allValues) - 2;
  const yMax = Math.max(...allValues) + 2;
  const yScale = (value) => 
  {
    const t = (value - yMin)/(yMax - yMin);
    return dimensions.marginTop + (1-t)*plotHeight;
  };

  const boxWidth = Math.max(50, plotWidth/(chartData.length*2));

  if (loading) return <div style={{ padding: 24 }}>Loading chart...</div>;
  if (error) return <div style={{ padding:24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{width:"100%", maxWidth:980, margin: "0 auto", padding: 24, fontFamily: "Arial, sans-serif"}}>
      <h2 style={{ marginBottom: 8 }}>University Score Distribution</h2>
      <p style={{ marginTop:0, marginBottom:18, color: "#555"}}>
        Boxplot featuring QS, THE, and ARWU scores for universities.
      </p>

      <svg
        width="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ border: "1px solid #ddd", borderRadius:12, background: "#fff" }}
      >
        {Array.from({length:6 }, (_, i) => {
          const value = yMin + (i*(yMax - yMin))/5;
          const y = yScale(value);
          return (
            <g key={i}>
              <line
                x1={dimensions.marginLeft}
                x2={dimensions.width - dimensions.marginRight}
                y1={y}
                y2={y}
                stroke="#eee"
              />
              <text
                x={dimensions.marginLeft-12}
                y={y+4}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* y-axis */}
        <line
          x1={dimensions.marginLeft}
          x2={dimensions.marginLeft}
          y1={dimensions.marginTop}
          y2={dimensions.height-dimensions.marginBottom}
          stroke="#333"
        />

        {chartData.map((d, i) => {
          const centerX = dimensions.marginLeft + (i+0.5)*(plotWidth/chartData.length);
          const s = d.stats;
          const yLow = yScale(s.whiskerLow);
          const yHigh = yScale(s.whiskerHigh);
          const yQ1 = yScale(s.q1);
          const yQ3 = yScale(s.q3);
          const yMedian = yScale(s.median);

          return (
            <g key={d.key}>
              <line
                x1={centerX}
                x2={centerX}
                y1={yHigh}
                y2={yLow}
                stroke="#333"
                strokeWidth="2"
              />
              <line x1={centerX-18} x2={centerX+18} y1={yHigh} y2={yHigh} stroke="#333" strokeWidth="2" />
              <line x1={centerX-18} x2={centerX+18} y1={yLow} y2={yLow} stroke="#333" strokeWidth="2" />

              <rect
                x={centerX - boxWidth/2}
                y={yQ3}
                width={boxWidth}
                height={Math.max(1, yQ1-yQ3)}
                rx="8"
                fill="#cfe8ff"
                stroke="#1d4ed8"
                strokeWidth="2"
              />

              <line
                x1={centerX - boxWidth/2}
                x2={centerX + boxWidth/2}
                y1={yMedian}
                y2={yMedian}
                stroke="#1d4ed8"
                strokeWidth="3"
              />
              {s.outliers.map((v, idx) => (
                <circle
                  key={idx}
                  cx={centerX}
                  cy={yScale(v)}
                  r="4"
                  fill="#ef4444"
                  opacity="0.85"
                />
              ))}

              <text
                x={centerX}
                y={dimensions.height-dimensions.marginBottom+28}
                textAnchor="middle"
                fontSize="13"
                fill="#222"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        <text
          x={18}
          y={dimensions.marginTop + plotHeight/2}
          transform={`rotate(-90 18 ${dimensions.marginTop + plotHeight/2})`}
          textAnchor="middle"
          fontSize="13"
          fill="#222"
        >
          Score
        </text>
      </svg>

      <div style={{marginTop: 12, color: "#555", fontSize: 13 }}>
      </div>
    </div>
  );
}
