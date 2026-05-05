# University Rankings Dashboard: Global Analysis of Academic Performance

An interactive web application built with React and D3.js to visualize and analyze 2026 global university rankings and the institutional factors that contribute to academic excellence.

## Features

- **Chart 1: Global Academic Power** - Treemap representing the hierarchical distribution of academic strength across regions and countries based on QS Scores
- **Chart 2: Reputation vs. Citations** - Scatterplot examining the correlation between academic reputation and research citations to identify "reputation premiums"
- **Chart 3: Regional Specialization** - Heatmap comparing world regions across key pillars: Industry Income, International Outlook, Research Quality, and Teaching
- **Chart 4: Ranking System Comparison** - Boxplots showing the statistical distribution and variance of scores across the QS, THE, and ARWU ranking systems

## Interactive Features

- Global filters (Region, Country, Univeristy Type, QS Score Range)
- Interactive sorting
- Cross-chart interactions
- Tooltips and hover effects
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure `world_university_rankings_2026.csv` is in the `public` folder

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── Chart1.js
│   ├── Chart2.js
│   ├── Chart3.js
│   ├── Chart4.js
│   ├── Dashboard.js
│   ├── FilterPanel.js
│   └── SummaryPanel.js
├── utils/
│   ├── dataLoader.js
│   └── colorScales.js
├── App.js
└── index.js
```

## Technologies Used

- React 18
- D3.js 7
- CSS3

## Data

The dashboard uses `world_university_rankings_2026.csv` which contains 57 globally ranked institutions across 20 countries and 7 world regions, with 30 columns of data including overall scores, sub-indicators for teaching and research, and institutional metrics like founded year and Nobel laureate counts.
