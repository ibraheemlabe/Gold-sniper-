# Sniper Gold Dashboard

A high-performance, technical dashboard for XAUUSD (Gold) fundamental analysis and scalping intel. Powered by Gemini 3 Flash with Google Search grounding.

## Features

- **AI Market Intel**: Real-time fundamental analysis using Gemini 3 Flash.
- **CME Scalp Zones**: Support and Resistance levels derived from CME Open Interest Heatmaps.
- **Price History**: Detailed charts for Week, Month, and Year trends (XAU/USD).
- **TradingView Integration**: Uses direct URL context from TradingView for precise price history.
- **Mission Plan**: Actionable strategy and motivation for gold scalpers.
- **Auto-Refresh**: Automatically updates market data every 5 minutes.
- **Robust Error Handling**: Built-in Error Boundary and fallback mechanisms for data fetching.

## Tech Stack

- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI SDK**: @google/genai

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sniper-gold-dashboard.git
   cd sniper-gold-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

To build the project for production:

```bash
npm run build
```

The output will be in the `dist/` directory, which can be hosted on any static site hosting service (Vercel, Netlify, GitHub Pages, etc.).

## License

MIT
