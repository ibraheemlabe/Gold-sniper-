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

export async function fetchGoldFundamentals(): Promise<GoldFundamentalData> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your .env file.");
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

    Return the response in JSON format:
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
        "year": [ {"date": "...", "price": 0}, ... ]
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
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    
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
    // Try with full grounding first
    return await attemptFetch(true);
  } catch (error) {
    console.warn("Initial fetch failed, retrying with simplified tools...", error);
    try {
      // Fallback to just Google Search for speed and reliability
      return await attemptFetch(false);
    } catch (fallbackError) {
      console.error("All fetch attempts failed:", fallbackError);
      throw fallbackError;
    }
  }
}
