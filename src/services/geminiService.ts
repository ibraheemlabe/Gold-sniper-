import { GoogleGenAI } from "@google/genai";


export interface Impact {
  immediate: string;
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
}

export interface DimensionData {
  analysis: string;
  impact: Impact;
  metaphor: string;
}

export interface GoalPlan {
  goal: string;
  steps: string[];
  motivation: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface HistoricalTrends {
  week: PricePoint[];
  month: PricePoint[];
  year: PricePoint[];
}

export interface NewsEvent {
  title: string;
  time: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
}

export interface GoldFundamentalData {
  macro: DimensionData;
  yields: DimensionData;
  sentiment: DimensionData;
  summary: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sources: { title: string; uri: string }[];
  lastUpdated: string;
  mentorAdvice: string;
  goalPlan: GoalPlan;
  historicalTrends: HistoricalTrends;
  newsToWatch: NewsEvent[];
  scalperLevels: {
    support: { level: number; reason: string }[];
    resistance: { level: number; reason: string }[];
    pivot: number;
  };
  cmeData?: {
    highOIStrikes: { strike: number; type: 'CALL' | 'PUT'; oi: string; expiration: string }[];
    heatmapSummary: string;
    contractExpirations: { code: string; dte: number; price: number }[];
  };
}

const MOCK_DATA: GoldFundamentalData = {
  macro: {
    analysis: "The US Dollar is showing signs of exhaustion as cooling inflation data suggests the Fed might pause rate hikes. This creates a massive tailwind for Gold as a non-yielding asset.",
    metaphor: "A coiled spring ready to snap higher as the weight of the Dollar lifts.",
    impact: { immediate: "Bullish", shortTerm: "Neutral", mediumTerm: "Bullish", longTerm: "Bullish" }
  },
  yields: {
    analysis: "10-Year Treasury yields are retreating from recent highs, reducing the opportunity cost of holding Gold. Watch the 4.2% level closely.",
    metaphor: "The gravity holding Gold down is weakening.",
    impact: { immediate: "Bullish", shortTerm: "Bullish", mediumTerm: "Neutral", longTerm: "Bullish" }
  },
  sentiment: {
    analysis: "Retail sentiment is currently split, but institutional flow shows heavy accumulation at the $2,680 support zone. Fear of missing out (FOMO) is building.",
    metaphor: "The smart money is quietly loading the boat.",
    impact: { immediate: "Neutral", shortTerm: "Bullish", mediumTerm: "Bullish", longTerm: "Bullish" }
  },
  summary: "Gold is entering a high-probability breakout phase supported by macro weakness in the USD and technical accumulation at key pivot levels.",
  bias: 'BULLISH',
  sources: [{ title: 'Market Example', uri: 'https://example.com' }],
  lastUpdated: new Date().toLocaleTimeString(),
  mentorAdvice: "Don't chase the green candles. Wait for the retest of the pivot at $2,715. Risk management is your only edge in this volatility. 💰",
  goalPlan: {
    goal: "Capture the $2,750 Breakout",
    steps: ["Wait for H1 close above $2,720", "Set SL at $2,705", "TP1 at $2,745"],
    motivation: "Discipline equals freedom. Stick to the sniper code."
  },
  historicalTrends: {
    week: [
      { date: "Mon", price: 2680 }, { date: "Tue", price: 2695 }, { date: "Wed", price: 2710 },
      { date: "Thu", price: 2705 }, { date: "Fri", price: 2725 }, { date: "Sat", price: 2722 }, { date: "Sun", price: 2730 }
    ],
    month: [],
    year: []
  },
  newsToWatch: [
    { title: "CPI Inflation Data", time: "13:30 UTC", importance: 'HIGH', impact: "High Volatility Expected" }
  ],
  scalperLevels: {
    support: [{ level: 2680, reason: "Daily Order Block" }, { level: 2700, reason: "Psychological Level" }],
    resistance: [{ level: 2745, reason: "Previous Month High" }],
    pivot: 2715
  }
};

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        throw new Error("Failed to parse AI response as JSON");
      }
    }
    throw new Error("No valid JSON found in AI response");
  }
}

export async function fetchGoldFundamentals(): Promise<GoldFundamentalData> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Falling back to mock data for demo.");
    return { ...MOCK_DATA, lastUpdated: `${new Date().toLocaleTimeString()} (DEMO MODE)` };
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Role: You are an advanced AI financial mentor for a "Gold Sniper Scalper".
    
    CRITICAL INSTRUCTIONS:
    1. PRICE DATA (GC1 & XAUUSD): Use Google Search and the provided TradingView context (https://www.tradingview.com/chart/XwQY6Sf4/) to extract the ABSOLUTE LATEST price history for Gold Futures (GC1) and Gold Spot (XAUUSD).
       - Provide at least 7-10 data points for each timeframe (Week, Month, Year).
       - Ensure dates are in a readable format (e.g., "Mon", "Mar 10").
    2. CME OPEN INTEREST HEATMAP: Identify the "Best Support" (Strike with the highest Put OI concentration) and "Best Resistance" (Strike with the highest Call OI concentration).
       - EXPLAIN THE "WHY": For each level, state the number of contracts and the expiration.
    3. CONTRACT EXPIRATIONS: Mention when the nearest major contracts expire.
    4. NO JARGON: Explain concepts simply.
    5. MOBILE OPTIMIZED COPY: Short, punchy sentences.
    6. Use #moneywise emoji 💰.

    Return the response in STRICT JSON format. Do not include any markdown formatting or extra text.
    {
      "macro": { "analysis": "...", "impact": { "immediate": "...", "shortTerm": "...", "mediumTerm": "...", "longTerm": "..." }, "metaphor": "..." },
      "yields": { "analysis": "...", "impact": { "immediate": "...", "shortTerm": "...", "mediumTerm": "...", "longTerm": "..." }, "metaphor": "..." },
      "sentiment": { "analysis": "...", "impact": { "immediate": "...", "shortTerm": "...", "mediumTerm": "...", "longTerm": "..." }, "metaphor": "..." },
      "summary": "...",
      "bias": "BULLISH/BEARISH/NEUTRAL",
      "mentorAdvice": "...",
      "goalPlan": { "goal": "...", "steps": ["...", "..."], "motivation": "..." },
      "historicalTrends": {
        "week": [ {"date": "...", "price": 0}, ... ],
        "month": [ {"date": "...", "price": 0}, ... ],
        "year": [ {"date": "...", "price": 0} ]
      },
      "newsToWatch": [ {"title": "...", "time": "...", "importance": "HIGH/MEDIUM/LOW", "impact": "..."} ],
      "scalperLevels": {
        "support": [ {"level": 0, "reason": "..."} ],
        "resistance": [ {"level": 0, "reason": "..."} ],
        "pivot": 0
      },
      "cmeData": {
        "highOIStrikes": [ {"strike": 0, "type": "CALL/PUT", "oi": "...", "expiration": "..."} ],
        "heatmapSummary": "...",
        "contractExpirations": [ {"code": "...", "dte": 0, "price": 0} ]
      }
    }
  `;

  async function attemptFetch(useUrlContext: boolean) {
    const tools: any[] = [{ googleSearch: {} }];
    if (useUrlContext) {
      tools.push({ urlContext: { entries: [{ url: "https://www.tradingview.com/chart/XwQY6Sf4/" }] } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '{}';
    const data = extractJson(text);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '',
    })).filter((s: any) => s.uri) || [];

    const normalizeDimension = (dim: any): DimensionData => ({
      analysis: dim?.analysis || '',
      metaphor: dim?.metaphor || '',
      impact: {
        immediate: dim?.impact?.immediate || '',
        shortTerm: dim?.impact?.shortTerm || '',
        mediumTerm: dim?.impact?.mediumTerm || '',
        longTerm: dim?.impact?.longTerm || '',
      }
    });

    const macro = normalizeDimension(data.macro);
    const yields = normalizeDimension(data.yields);
    const sentiment = normalizeDimension(data.sentiment);
    const goalPlan = {
      goal: data.goalPlan?.goal || '',
      steps: data.goalPlan?.steps || [],
      motivation: data.goalPlan?.motivation || ''
    };

    const historicalTrends = data.historicalTrends || { week: [], month: [], year: [] };
    if (!historicalTrends.week) historicalTrends.week = [];
    if (!historicalTrends.month) historicalTrends.month = [];
    if (!historicalTrends.year) historicalTrends.year = [];

    const scalperLevels = data.scalperLevels || { support: [], resistance: [], pivot: 0 };
    if (!scalperLevels.support) scalperLevels.support = [];
    if (!scalperLevels.resistance) scalperLevels.resistance = [];

    const newsToWatch = data.newsToWatch || [];

    return {
      ...data,
      macro,
      yields,
      sentiment,
      goalPlan,
      historicalTrends,
      scalperLevels,
      newsToWatch,
      sources,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }

  try {
    return await attemptFetch(true);
  } catch (error) {
    console.warn("Initial fetch failed, retrying with simplified tools...", error);
    try {
      return await attemptFetch(false);
    } catch (fallbackError) {
      console.error("All fetch attempts failed. Falling back to mock data.", fallbackError);
      return { ...MOCK_DATA, lastUpdated: `${new Date().toLocaleTimeString()} (OFFLINE MODE)` };
    }
  }
}
